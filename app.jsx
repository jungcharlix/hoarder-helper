// 囤積症幫手 — main App with Tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#D4A574", "#8B7355", "#F5EFE6"],
  "fontSize": 15,
  "dark": false,
  "mascot": true,
  "decisionFlow": "quad",
  "encouragement": "warm",
  "dailyGoal": 25
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const [view, setView] = React.useState({ name: 'tab' });
  const [menuOpen, setMenuOpen] = React.useState(false);

  // ─── Users ───
  const [users, setUsersState] = React.useState(() => loadUsers());
  const [activeUserId, setActiveUserIdState] = React.useState(() => {
    const id = getActiveUserId();
    const list = loadUsers();
    return list.find(u => u.id === id) ? id : list[0].id;
  });
  const activeUser = users.find(u => u.id === activeUserId) || users[0];

  const setUsers = (next) => { setUsersState(next); saveUsers(next); };
  const switchUser = (id) => {
    setActiveUserIdState(id);
    setActiveUserId(id);
    // load that user's data
    const fresh = seedFreshUser();
    const loadedRooms = loadUserRooms(id);
    if (loadedRooms) {
      for (const r of loadedRooms) for (const z of r.zones) {
        if (!z.itemList || z.itemList.length === 0) {
          z.itemList = seedItemsForZone(r.name, z.name, z.items || 20);
        }
      }
      setRoomsState(recomputeRoomTotals(loadedRooms));
    } else {
      setRoomsState(fresh.rooms);
    }
    setCustomGiveawaysState(loadUserGiveaways(id) || []);
  };

  // ─── Per-user data ───
  const [rooms, setRoomsState] = React.useState(() => {
    const id = getActiveUserId();
    let loaded = loadUserRooms(id);
    if (!loaded) {
      // Migrate from old single-user keys if present (one-time)
      try {
        const legacy = localStorage.getItem('hoarder-helper.rooms.v1');
        if (legacy) loaded = JSON.parse(legacy);
      } catch (e) {}
    }
    if (!loaded) loaded = JSON.parse(JSON.stringify(DEFAULT_ROOMS));
    for (const r of loaded) for (const z of r.zones) {
      if (!z.itemList || z.itemList.length === 0) {
        z.itemList = seedItemsForZone(r.name, z.name, z.items || 20);
      }
    }
    return loaded;
  });
  const [customGiveaways, setCustomGiveawaysState] = React.useState(() => {
    const id = getActiveUserId();
    let g = loadUserGiveaways(id);
    if (!g) {
      try {
        const legacy = localStorage.getItem('hoarder-helper.giveaways.v1');
        if (legacy) g = JSON.parse(legacy);
      } catch (e) {}
    }
    return g || JSON.parse(JSON.stringify(GIVEAWAY_LIST));
  });

  // Sync rooms → window so existing screens see latest.
  recomputeRoomTotals(rooms);
  window.ROOMS = rooms;
  window.ALL_ZONES_COUNT = rooms.reduce((s, r) => s + r.zones.length, 0);

  const setRooms = (next) => {
    const fresh = recomputeRoomTotals(JSON.parse(JSON.stringify(next)));
    setRoomsState(fresh);
    saveUserRooms(activeUserId, fresh);
  };
  const setCustomGiveaways = (next) => {
    setCustomGiveawaysState(next);
    saveUserGiveaways(activeUserId, next);
  };

  const resetData = () => {
    const fresh = seedFreshUser();
    setRoomsState(fresh.rooms);
    setCustomGiveawaysState(fresh.giveaways);
    saveUserRooms(activeUserId, fresh.rooms);
    saveUserGiveaways(activeUserId, fresh.giveaways);
  };

  const importBackup = (data) => {
    if (!data || !data.rooms) return;
    // Replace current user's data with imported
    let imported = data.rooms;
    for (const r of imported) for (const z of r.zones) {
      if (!z.itemList || z.itemList.length === 0) {
        z.itemList = seedItemsForZone(r.name, z.name, z.items || 20);
      }
    }
    imported = recomputeRoomTotals(imported);
    setRoomsState(imported);
    setCustomGiveawaysState(data.giveaways || []);
    saveUserRooms(activeUserId, imported);
    saveUserGiveaways(activeUserId, data.giveaways || []);
    // Also update user profile from import (name/emoji)
    if (data.user) {
      const updatedUsers = users.map(u => u.id === activeUserId
        ? { ...u, name: data.user.name || u.name, emoji: data.user.emoji || u.emoji }
        : u);
      setUsers(updatedUsers);
    }
    alert('匯入完成！');
    setView({ name: 'tab' });
    setTab('home');
  };

  // Apply theme + tweaks to CSS vars
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--fs-base', `${t.fontSize}px`);
    const [primary, deep, soft] = t.palette;
    root.style.setProperty('--accent', primary);
    root.style.setProperty('--accent-deep', deep || primary);
    root.style.setProperty('--accent-soft', soft || '#ECD9B7');
    document.body.setAttribute('data-theme', t.dark ? 'dark' : 'light');
    document.querySelectorAll('.app-shell').forEach(el => {
      el.setAttribute('data-theme', t.dark ? 'dark' : 'light');
    });
  }, [t]);

  const go = (name, payload) => setView({ name, ...payload });
  const goBack = () => setView({ name: 'tab' });

  const renderCurrent = () => {
    if (view.name === 'room') return <RoomScreen roomId={view.roomId} onBack={goBack} onStartZone={(zoneId) => go('clean', { zoneId })} onMenu={() => setMenuOpen(true)} />;
    if (view.name === 'clean') return <CleaningScreen zoneId={view.zoneId} rooms={rooms} setRooms={setRooms} customGiveaways={customGiveaways} setCustomGiveaways={setCustomGiveaways} onBack={goBack} onComplete={() => { setTab('home'); goBack(); }} />;
    if (view.name === 'reminders') return <RemindersScreen onBack={goBack} />;
    if (view.name === 'manage') return <ManageScreen rooms={rooms} setRooms={setRooms} onBack={goBack} />;
    if (view.name === 'users') return <UsersScreen users={users} setUsers={setUsers} activeUserId={activeUserId} onSwitch={switchUser} onBack={goBack} />;
    if (view.name === 'export') return <ExportScreen user={activeUser} rooms={rooms} giveaways={customGiveaways} onImport={importBackup} onBack={goBack} />;

    if (tab === 'home') return <HomeScreen rooms={rooms} t={t} setTweak={setTweak} user={activeUser} onGo={(n) => n === 'list' ? setTab('list') : go(n)} onStartZone={() => go('clean', { zoneId: 'living-3' })} onOpenZone={(zoneId) => go('clean', { zoneId })} onMenu={() => setMenuOpen(true)} />;
    if (tab === 'map') return <MapScreen onPickRoom={(roomId) => go('room', { roomId })} onManage={() => go('manage')} onMenu={() => setMenuOpen(true)} />;
    if (tab === 'list') return <ListScreen rooms={rooms} setRooms={setRooms} customGiveaways={customGiveaways} setCustomGiveaways={setCustomGiveaways} onMenu={() => setMenuOpen(true)} />;
    if (tab === 'record') return <RecordScreen rooms={rooms} setRooms={setRooms} onMenu={() => setMenuOpen(true)} onGoExport={() => go('export')} />;
    if (tab === 'support') return <SupportScreen t={t} onMenu={() => setMenuOpen(true)} />;
    return null;
  };

  const showBottomNav = view.name === 'tab';

  return (
    <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap: 20 }}>
      <div style={{ display:'flex', gap: 8, alignItems:'center', color:'#D9C5A8', fontFamily:'var(--font-display)', fontSize: 13, letterSpacing:'0.06em' }}>
        <span>囤囤幫手</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ fontStyle:'italic', opacity: 0.7 }}>A Gentle Tidying Companion</span>
      </div>

      <IOSDevice width={402} height={874} dark={t.dark}>
        <div className="app-shell" data-theme={t.dark ? 'dark' : 'light'}>
          <div style={{ height: 54 }}></div>
          <div className="app-content">
            {renderCurrent()}
          </div>
          {showBottomNav && <BottomNav tab={tab} onTab={setTab} />}
          <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)}
                    user={activeUser} userCount={users.length}
                    onGo={(n) => go(n)} onResetData={resetData}
                    t={t} setTweak={setTweak}/>
        </div>
      </IOSDevice>

      <div style={{ color:'#9C8770', fontSize: 11, fontFamily:'var(--font-body)', textAlign:'center', maxWidth: 380, lineHeight: 1.6 }}>
        以 iPhone 為主要原型 · UI 已設計為響應式，可適配 Android / iPad / 桌面網頁<br/>
        <span style={{ opacity: 0.6 }}>RESPONSIVE · iOS · ANDROID · TABLET · WEB</span>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance">
          <TweakToggle label="深色模式 Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />
          <TweakSlider label="字體大小 Font size" value={t.fontSize} min={13} max={18} unit="px"
                       onChange={(v) => setTweak('fontSize', v)} />
          <TweakColor label="主色調 Palette" value={t.palette}
                      options={[
                        ['#D4A574', '#8B7355', '#F5EFE6'],
                        ['#C7A883', '#7A8B6F', '#EEF1EA'],
                        ['#B89F8C', '#7C6A5E', '#F1EDE8'],
                        ['#C49E92', '#8E6F66', '#F4EAE6'],
                        ['#A8B3C4', '#6E7A8A', '#EDF0F4'],
                      ]}
                      onChange={(v) => setTweak('palette', v)} />
        </TweakSection>
        <TweakSection label="Companion">
          <TweakToggle label="吉祥物 囤囤 Mascot" value={t.mascot}
                       onChange={(v) => setTweak('mascot', v)} />
          <TweakRadio label="鼓勵語強度 Encouragement"
                      value={t.encouragement}
                      options={[
                        { value:'gentle', label:'輕柔' },
                        { value:'warm',   label:'溫暖' },
                        { value:'strong', label:'強烈' },
                      ]}
                      onChange={(v) => setTweak('encouragement', v)} />
          <TweakSlider label="今日任務目標 Daily goal" value={t.dailyGoal} min={5} max={60} step={5} unit=" 件"
                       onChange={(v) => setTweak('dailyGoal', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
