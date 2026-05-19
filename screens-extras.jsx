// 囤積症幫手 — Record/History, Giveaway List, Support/Achievements, Reminders

const { useState: useStateC } = React;

// ───────── RECORD (History + stats) ─────────
function RecordScreen({ onMenu, onGoExport, rooms, setRooms }) {
  const totalKept = HISTORY.reduce((s,h) => s + h.kept, 0);
  const totalDisc = HISTORY.reduce((s,h) => s + h.discarded, 0);
  const totalGive = HISTORY.reduce((s,h) => s + h.given, 0);

  // Photo lightbox state
  const [lightbox, setLightbox] = useStateC(null); // { zoneId, idx }

  const mutateZonePhotos = (zoneId, fn) => {
    const next = JSON.parse(JSON.stringify(rooms));
    for (const r of next) for (const z of r.zones) {
      if (z.id === zoneId) { z.photos = fn(z.photos || []); break; }
    }
    setRooms(next);
  };
  const addPhoto = (zoneId, photo) => mutateZonePhotos(zoneId, list => [...list, photo]);
  const deletePhoto = (zoneId, id) => mutateZonePhotos(zoneId, list => list.filter(p => p.id !== id));
  const updatePhoto = (zoneId, id, patch) => mutateZonePhotos(zoneId, list => list.map(p => p.id === id ? { ...p, ...patch } : p));

  // Collect zones with photos + provide entry for ones without
  const zonesWithPhotos = [];
  const zonesEmpty = [];
  for (const r of rooms) for (const z of r.zones) {
    const entry = { roomName: r.name, roomEn: r.enName, zone: z };
    if ((z.photos || []).length > 0) zonesWithPhotos.push(entry);
    else zonesEmpty.push(entry);
  }
  // Sort with-photos: latest photo first
  zonesWithPhotos.sort((a, b) => {
    const ta = Math.max(...(a.zone.photos || []).map(p => p.ts || 0));
    const tb = Math.max(...(b.zone.photos || []).map(p => p.ts || 0));
    return tb - ta;
  });

  const activeLightbox = lightbox ? (() => {
    for (const r of rooms) for (const z of r.zones) {
      if (z.id === lightbox.zoneId) return { zone: z, room: r };
    }
    return null;
  })() : null;

  return (
    <div>
      <AppBar title="紀錄" en="My journey"
              left={<button className="icon-btn" onClick={onMenu}><Icon.menu /></button>}
              right={<button className="icon-btn" onClick={onGoExport} title="匯出資料"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 21h14"/></svg></button>}/>

      {/* Headline stats */}
      <div className="section-tight">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div>
              <div className="h-section">總計 · Total</div>
              <div className="h-display" style={{ fontSize: 26, marginTop: 4 }}>
                {totalKept + totalDisc + totalGive} <span style={{ fontSize: 14, color:'var(--muted)' }}>件</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="h-section">天數</div>
              <div className="h-display" style={{ fontSize: 26, marginTop: 4 }}>31 <span style={{ fontSize: 14, color:'var(--muted)' }}>天</span></div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8 }}>
            {[
              { v: totalKept, l:'留下', cls:'chip-keep' },
              { v: totalDisc, l:'丟棄', cls:'chip-discard' },
              { v: totalGive, l:'送出', cls:'chip-give' },
            ].map((s,i) => (
              <div key={i} className="card-soft" style={{ textAlign:'center', padding:'10px 4px' }}>
                <div style={{ fontSize: 18, fontWeight:500, color:'var(--text)' }}>{s.v}</div>
                <span className={`chip ${s.cls}`} style={{ marginTop: 4 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly chart placeholder */}
      <div className="section">
        <h3 className="h-section" style={{ marginBottom: 10 }}>近 7 天 · Last 7 days</h3>
        <div className="card" style={{ padding:'18px 14px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', height: 110, gap: 6 }}>
            {[12, 8, 22, 15, 18, 24, 19].map((v, i) => (
              <div key={i} style={{ flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap: 4 }}>
                <div style={{ width:'100%', height: `${(v/30)*100}%`, background:'linear-gradient(180deg, var(--accent) 0%, var(--accent-deep) 100%)', borderRadius:'4px 4px 2px 2px' }}></div>
                <span className="t-tiny" style={{ fontSize: 9 }}>{['一','二','三','四','五','六','日'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Space photos / before-after journey */}
      <div className="section">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <h3 className="h-section">整理歷程 · Before & After</h3>
          <span className="t-tiny">{zonesWithPhotos.length} 區有照片</span>
        </div>

        <div className="card-soft" style={{ marginBottom: 14 }}>
          <div className="t-small" style={{ textWrap:'pretty' }}>
            📷 為每個空間拍下整理前後的樣子。每張都是你前進的證據。
          </div>
        </div>

        {zonesWithPhotos.length > 0 && (
          <div className="stack-2" style={{ marginBottom: 14 }}>
            {zonesWithPhotos.map(({ zone, roomName }) => (
              <div key={zone.id} className="card" style={{ padding: 14 }}>
                <div className="row-between" style={{ marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color:'var(--text)' }}>{zone.name}</div>
                    <div className="t-tiny">{roomName} · {(zone.photos || []).length} 張照片</div>
                  </div>
                  <AddPhotoButton small label="加入" onAdd={(p) => addPhoto(zone.id, p)}/>
                </div>
                <PhotoStrip
                  photos={zone.photos || []}
                  onTap={(i) => setLightbox({ zoneId: zone.id, idx: i })}
                  onAdd={null}/>
                {(zone.photos || []).length >= 2 && (
                  <button
                    onClick={() => setLightbox({ zoneId: zone.id, idx: 0 })}
                    className="btn btn-ghost btn-block"
                    style={{ fontSize: 12, padding:'6px 12px', marginTop: 4 }}>
                    ⇔ 比較前後差異
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick add for any zone */}
        {zonesEmpty.length > 0 && (
          <details>
            <summary style={{ fontSize: 12, color:'var(--muted)', cursor:'pointer', padding: 6, listStyle:'none' }}>
              ▸ 為其他 {zonesEmpty.length} 個空間加入第一張照片
            </summary>
            <div className="stack-2" style={{ marginTop: 10, maxHeight: 280, overflowY:'auto' }}>
              {zonesEmpty.map(({ zone, roomName }) => (
                <div key={zone.id} className="card-soft" style={{ padding: 10, display:'flex', alignItems:'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color:'var(--text)' }}>{zone.name}</div>
                    <div className="t-tiny">{roomName}</div>
                  </div>
                  <AddPhotoButton small onAdd={(p) => addPhoto(zone.id, p)}/>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* History list */}
      <div className="section">
        <h3 className="h-section" style={{ marginBottom: 10 }}>已完成區域 · Done</h3>
        <div className="stack-2">
          {HISTORY.map((h, i) => (
            <div key={i} className="card-soft">
              <div className="row-between" style={{ marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color:'var(--text)' }}>{h.zone}</div>
                  <div className="t-tiny">{h.room} · {h.date}</div>
                </div>
                <Icon.check style={{ width:18, height:18, color:'var(--c-give)' }}/>
              </div>
              <div style={{ display:'flex', gap: 4, fontSize: 11 }}>
                <span className="chip chip-keep">留 {h.kept}</span>
                <span className="chip chip-discard">丟 {h.discarded}</span>
                <span className="chip chip-give">送 {h.given}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export shortcut */}
      <div className="section">
        <h3 className="h-section" style={{ marginBottom: 10 }}>資料 · Backup & Export</h3>
        <div className="stack-2">
          <div className="card" style={{ display:'flex', alignItems:'center', gap: 12, padding: 14, cursor:'pointer' }} onClick={onGoExport}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background:'var(--accent-soft)', display:'grid', placeItems:'center', fontSize: 22 }}>💾</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color:'var(--text)' }}>完整備份 · 可匯入</div>
              <div className="t-tiny">日後可還原所有資料</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}><path d="M9 6l6 6-6 6"/></svg>
          </div>
          <div className="card" style={{ display:'flex', alignItems:'center', gap: 12, padding: 14, cursor:'pointer' }} onClick={onGoExport}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background:'var(--c-give-bg)', display:'grid', placeItems:'center', fontSize: 22 }}>📊</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color:'var(--text)' }}>整理報表</div>
              <div className="t-tiny">統計圖表、各空間進度、送養紀錄</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}><path d="M9 6l6 6-6 6"/></svg>
          </div>
          <div className="card" style={{ display:'flex', alignItems:'center', gap: 12, padding: 14, cursor:'pointer' }} onClick={onGoExport}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background:'var(--accent-soft)', display:'grid', placeItems:'center', fontSize: 22 }}>📖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color:'var(--text)' }}>物品紀念冊</div>
              <div className="t-tiny">每件物品的詳細紀錄與你寫下的回憶</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </div>
        <button className="btn btn-secondary btn-block" style={{ marginTop: 10, fontSize: 13 }} onClick={onGoExport}>
          開啟「資料」頁面 · 包含匯入備份
        </button>
      </div>
      <div style={{ height: 30 }}></div>

      {lightbox && activeLightbox && (
        <PhotoLightbox
          photos={activeLightbox.zone.photos || []}
          startIdx={lightbox.idx}
          zoneName={`${activeLightbox.room.name} · ${activeLightbox.zone.name}`}
          onClose={() => setLightbox(null)}
          onDelete={(id) => deletePhoto(lightbox.zoneId, id)}
          onUpdate={(id, patch) => updatePhoto(lightbox.zoneId, id, patch)}/>
      )}
    </div>
  );
}
function ListScreen({ rooms, setRooms, customGiveaways, setCustomGiveaways, onMenu }) {
  const [tab, setTab] = useStateC('all');
  const [view, setView] = useStateC('list'); // 'list' | 'stats'
  const [editing, setEditing] = useStateC(null); // entry being edited
  const [adding, setAdding] = useStateC(false);

  // Derive zone-linked giveaway entries (decision === 'give' or 'sell')
  const zoneLinked = [];
  for (const r of rooms) for (const z of r.zones) {
    for (const it of (z.itemList || [])) {
      if (it.decision === 'give' || it.decision === 'sell') {
        zoneLinked.push({
          id: `link-${it.id}`,
          source: 'zone', itemId: it.id, zoneId: z.id, roomId: r.id,
          name: it.name, emoji: it.emoji || '📦',
          type: it.decision === 'sell' ? '賣' : '送',
          status: it.giveStatus || '待聯絡',
          recipient: it.recipient || '',
          price: it.price || '',
          date: it.giveDate || '',
          roomName: r.name, zoneName: z.name,
        });
      }
    }
  }
  // Custom giveaway entries (not tied to a zone)
  const customEntries = (customGiveaways || []).map(g => ({
    ...g, source: 'custom', emoji: g.emoji || (g.type === '賣' ? '🏷️' : '🎁'),
  }));

  const all = [...zoneLinked, ...customEntries];
  const filtered = all.filter(g => tab === 'all' || g.type === tab);
  const counts = {
    all: all.length,
    送: all.filter(g => g.type === '送').length,
    賣: all.filter(g => g.type === '賣').length,
  };

  const statusColor = (s) => {
    if (s === '已送出' || s === '已售出') return 'var(--c-give)';
    if (s === '上架中' || s === '已聯絡') return 'var(--accent-deep)';
    return 'var(--muted)';
  };

  // Mutations
  const updateEntry = (entry, patch) => {
    if (entry.source === 'custom') {
      setCustomGiveaways(customGiveaways.map(g => g.id === entry.id ? { ...g, ...patch } : g));
    } else {
      // mutate zone item
      const next = JSON.parse(JSON.stringify(rooms));
      for (const r of next) for (const z of r.zones) {
        const it = (z.itemList || []).find(i => i.id === entry.itemId);
        if (it) {
          if (patch.status !== undefined) it.giveStatus = patch.status;
          if (patch.recipient !== undefined) it.recipient = patch.recipient;
          if (patch.price !== undefined) it.price = patch.price;
          if (patch.date !== undefined) it.giveDate = patch.date;
          if (patch.type !== undefined) it.decision = patch.type === '賣' ? 'sell' : 'give';
        }
      }
      setRooms(next);
    }
  };

  const deleteEntry = (entry) => {
    if (entry.source === 'custom') {
      setCustomGiveaways(customGiveaways.filter(g => g.id !== entry.id));
    } else {
      // remove from giveaway list = unflag decision (back to undecided)
      const next = JSON.parse(JSON.stringify(rooms));
      for (const r of next) for (const z of r.zones) {
        const it = (z.itemList || []).find(i => i.id === entry.itemId);
        if (it) { delete it.decision; delete it.giveStatus; delete it.recipient; delete it.price; delete it.giveDate; }
      }
      setRooms(next);
    }
  };

  const addEntry = (newEntry) => {
    const id = `cg-${Date.now()}`;
    setCustomGiveaways([{ id, ...newEntry }, ...customGiveaways]);
    setAdding(false);
  };

  // Convert a custom giveaway into a zone-linked item
  const linkToZone = (entry, zoneId) => {
    const next = JSON.parse(JSON.stringify(rooms));
    let added = false;
    for (const r of next) for (const z of r.zones) {
      if (z.id === zoneId) {
        z.itemList = z.itemList || [];
        z.itemList.push({
          id: `it-from-give-${Date.now()}`,
          emoji: entry.emoji || '📦', name: entry.name,
          desc: '', hint: '',
          decision: entry.type === '賣' ? 'sell' : 'give',
          giveStatus: entry.status, recipient: entry.recipient,
          price: entry.price, giveDate: entry.date,
        });
        added = true;
      }
    }
    if (added) {
      setRooms(next);
      setCustomGiveaways(customGiveaways.filter(g => g.id !== entry.id));
    }
  };

  return (
    <div>
      <AppBar title="送養清單" en="Find new homes"
              left={<button className="icon-btn" onClick={onMenu}><Icon.menu /></button>}
              right={<button className="icon-btn" onClick={() => setAdding(true)}><Icon.plus /></button>}/>

      <div className="section-tight">
        {/* View toggle */}
        <div style={{ display:'flex', gap: 6, marginBottom: 12,
          background:'var(--card-soft)', padding: 3, borderRadius: 10 }}>
          <button onClick={() => setView('list')}
            style={{ flex: 1, padding:'7px 12px', fontSize: 13, cursor:'pointer',
              border: 0, borderRadius: 8,
              background: view === 'list' ? 'var(--card)' : 'transparent',
              color: view === 'list' ? 'var(--text)' : 'var(--muted)',
              boxShadow: view === 'list' ? 'var(--shadow-sm)' : 'none',
              fontWeight: view === 'list' ? 500 : 400,
            }}>📋 清單</button>
          <button onClick={() => setView('stats')}
            style={{ flex: 1, padding:'7px 12px', fontSize: 13, cursor:'pointer',
              border: 0, borderRadius: 8,
              background: view === 'stats' ? 'var(--card)' : 'transparent',
              color: view === 'stats' ? 'var(--text)' : 'var(--muted)',
              boxShadow: view === 'stats' ? 'var(--shadow-sm)' : 'none',
              fontWeight: view === 'stats' ? 500 : 400,
            }}>📊 販售統計</button>
        </div>

        {view === 'stats' ? (
          <SellStatsPanel rooms={rooms} customGiveaways={customGiveaways}/>
        ) : (
        <>
        <div style={{ display:'flex', gap: 8, marginBottom: 14 }}>
          {[
            { id:'all', label:'全部', n: counts.all },
            { id:'送', label:'送出', n: counts.送 },
            { id:'賣', label:'販售', n: counts.賣 },
          ].map(o => (
            <button key={o.id} className={`btn ${tab === o.id ? '' : 'btn-secondary'}`}
                    style={{ flex: 1, padding:'8px 12px', fontSize: 13 }}
                    onClick={() => setTab(o.id)}>
              {o.label} <span style={{ opacity: 0.7, marginLeft: 4 }}>{o.n}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card-soft" style={{ textAlign:'center', padding:'30px 14px' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎁</div>
            <div className="t-body" style={{ marginBottom: 16, textWrap:'pretty' }}>
              還沒有要送出的物品。<br/>
              整理時把物品標為「送出 / 販售」會自動出現在這裡，<br/>
              也可以直接新增。
            </div>
            <button className="btn" onClick={() => setAdding(true)}>
              <Icon.plus style={{ width:14, height:14 }}/> 新增物品
            </button>
          </div>
        ) : (
          <div className="stack-2">
            {filtered.map(g => (
              <div key={g.id} className="card" style={{ padding: 14, display:'flex', gap: 12, alignItems:'center', cursor:'pointer' }}
                   onClick={() => setEditing(g)}>
                <div style={{ width: 46, height: 46, borderRadius: 10,
                              background: g.type === '送' ? 'var(--c-give-bg)' : 'var(--accent-soft)',
                              display:'grid', placeItems:'center', flexShrink: 0,
                              color: g.type === '送' ? 'var(--c-give)' : 'var(--accent-deep)' }}>
                  <span style={{ fontSize: 22 }}>{g.emoji}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-between">
                    <div style={{ fontSize: 14, fontWeight: 500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.name}</div>
                    <span style={{ fontSize: 11, color: statusColor(g.status), fontWeight: 500, marginLeft: 8, whiteSpace:'nowrap' }}>{g.status}</span>
                  </div>
                  <div className="t-tiny" style={{ marginTop: 3, display:'flex', gap: 8, alignItems:'center' }}>
                    {g.source === 'zone' && (
                      <span style={{ color:'var(--accent-deep)', display:'inline-flex', alignItems:'center', gap: 3 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7L11.5 5.5M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7L12.5 18.5"/></svg>
                        {g.roomName}·{g.zoneName}
                      </span>
                    )}
                    {g.source === 'custom' && <span style={{ opacity: 0.6 }}>獨立新增</span>}
                    {(g.recipient || g.price) && <span>· {g.type === '送' ? g.recipient : g.price}</span>}
                    {g.date && <span>· {g.date}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </div>
      <div style={{ height: 30 }}></div>

      {editing && (
        <EditGiveawaySheet
          entry={editing}
          rooms={rooms}
          onClose={() => setEditing(null)}
          onUpdate={(patch) => { updateEntry(editing, patch); setEditing(null); }}
          onDelete={() => { deleteEntry(editing); setEditing(null); }}
          onLink={(zoneId) => { linkToZone(editing, zoneId); setEditing(null); }}
        />
      )}
      {adding && (
        <EditGiveawaySheet
          rooms={rooms}
          isNew
          onClose={() => setAdding(false)}
          onAdd={(entry) => addEntry(entry)}
        />
      )}
    </div>
  );
}

function EditGiveawaySheet({ entry, isNew, rooms, onClose, onUpdate, onDelete, onAdd, onLink }) {
  const [name, setName] = useStateC(entry?.name || '');
  const [emoji, setEmoji] = useStateC(entry?.emoji || '🎁');
  const [type, setType] = useStateC(entry?.type || '送');
  const [status, setStatus] = useStateC(entry?.status || '待聯絡');
  const [recipient, setRecipient] = useStateC(entry?.recipient || '');
  const [price, setPrice] = useStateC(entry?.price || '');
  const [date, setDate] = useStateC(entry?.date || '');
  const [showLink, setShowLink] = useStateC(false);

  const statusesGive = ['待聯絡', '已聯絡', '已送出'];
  const statusesSell = ['待拍照', '上架中', '已售出'];
  const statuses = type === '送' ? statusesGive : statusesSell;
  const emojiSet = ['🎁','🏷️','📦','👕','📚','🧸','💿','🍶','🪴','📱','💄','🍳','🪑','🎨','📷','⌚','🎒','👜'];

  const submit = () => {
    const patch = { name: name.trim(), emoji, type, status, recipient: recipient.trim(), price: price.trim(), date: date.trim() };
    if (!patch.name) return;
    if (isNew) onAdd(patch);
    else onUpdate(patch);
  };

  return (
    <Sheet open={true} onClose={onClose}>
      <div style={{ padding: '4px 4px 4px' }}>
        <div className="row-between" style={{ marginBottom: 4 }}>
          <div className="h-title" style={{ fontSize: 19 }}>{isNew ? '新增送養' : '編輯送養'}</div>
          {entry?.source === 'zone' && (
            <span className="chip chip-accent" style={{ fontSize: 11 }}>
              已連動 · {entry.roomName}·{entry.zoneName}
            </span>
          )}
        </div>
        <div className="t-small" style={{ marginBottom: 16 }}>
          {isNew ? '加入想送出或販售的物品。' : entry?.source === 'zone' ? '這件物品來自區域，更動會同步回該區的決定。' : '獨立新增的物品。'}
        </div>

        {/* type */}
        <div className="t-tiny" style={{ marginBottom: 6 }}>類型</div>
        <div style={{ display:'flex', gap: 6, marginBottom: 12 }}>
          {['送', '賣'].map(typ => (
            <button key={typ}
                    onClick={() => { setType(typ); setStatus(typ === '送' ? statusesGive[0] : statusesSell[0]); }}
                    className="btn"
                    style={{ flex: 1, padding:'8px 12px', fontSize: 13,
                      background: type === typ ? (typ === '送' ? 'var(--c-give)' : 'var(--accent-deep)') : 'var(--card-soft)',
                      color: type === typ ? '#FFFCF7' : 'var(--text)' }}>
              {typ === '送' ? '🎁 送出' : '🏷️ 販售'}
            </button>
          ))}
        </div>

        {/* emoji */}
        <div className="t-tiny" style={{ marginBottom: 6 }}>圖示</div>
        <div style={{ display:'flex', gap: 4, flexWrap:'wrap', marginBottom: 12 }}>
          {emojiSet.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
                    style={{ width: 32, height: 32, fontSize: 18, lineHeight: 1, cursor:'pointer',
                      borderRadius: 8,
                      border: emoji === e ? '1.5px solid var(--accent-deep)' : '0.5px solid var(--border)',
                      background: emoji === e ? 'var(--accent-soft)' : 'var(--card-soft)' }}>{e}</button>
          ))}
        </div>

        <div className="t-tiny" style={{ marginBottom: 6 }}>名稱 *</div>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
               placeholder="例如：未拆封的書、舊外套"
               style={giveInputStyle}/>

        <div className="t-tiny" style={{ marginBottom: 6, marginTop: 12 }}>狀態</div>
        <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 12 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatus(s)} className="chip"
                    style={{ padding:'6px 12px', cursor:'pointer', fontSize: 12,
                      background: status === s ? 'var(--accent-soft)' : 'var(--card-soft)',
                      color: status === s ? 'var(--accent-deep)' : 'var(--muted)',
                      border:'0.5px solid ' + (status === s ? 'var(--accent)' : 'var(--border)') }}>{s}</button>
          ))}
        </div>

        {type === '送' ? (
          <>
            <div className="t-tiny" style={{ marginBottom: 6, marginTop: 12 }}>送給誰（可選）</div>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)}
                   placeholder="例如：朋友 A、社區公告" style={giveInputStyle}/>
          </>
        ) : (
          <>
            <div className="t-tiny" style={{ marginBottom: 6, marginTop: 12 }}>價格（可選）</div>
            <input value={price} onChange={(e) => setPrice(e.target.value)}
                   placeholder="例如：NT$ 300、面交價" style={giveInputStyle}/>
          </>
        )}

        <div className="t-tiny" style={{ marginBottom: 6, marginTop: 12 }}>日期 / 平台（可選）</div>
        <input value={date} onChange={(e) => setDate(e.target.value)}
               placeholder="例如：5/14、蝦皮 3 天" style={giveInputStyle}/>

        {!isNew && entry?.source === 'custom' && (
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-ghost btn-block" style={{ fontSize: 12 }} onClick={() => setShowLink(!showLink)}>
              {showLink ? '⌃ 收起' : '↔ 連動到某個區域'}
            </button>
            {showLink && (
              <div className="card-soft fade-in" style={{ marginTop: 8, maxHeight: 180, overflowY:'auto' }}>
                {rooms.map(r => (
                  <div key={r.id}>
                    <div className="t-tiny" style={{ padding:'6px 0 2px', fontWeight: 600, color:'var(--text)' }}>{r.name}</div>
                    {r.zones.map(z => (
                      <button key={z.id} onClick={() => onLink(z.id)}
                              style={{ display:'block', width:'100%', textAlign:'left', padding:'6px 8px', background:'transparent', border:0, borderRadius: 6, cursor:'pointer', fontSize: 13, color:'var(--text-soft)' }}>
                        → {z.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display:'flex', gap: 10, marginTop: 18 }}>
          {!isNew && (
            <button className="btn btn-secondary" style={{ flex: 1, color:'var(--c-discard)' }} onClick={onDelete}>
              {entry?.source === 'zone' ? '從清單移除' : '刪除'}
            </button>
          )}
          <button className="btn" style={{ flex: 2 }} disabled={!name.trim()} onClick={submit}>
            {isNew ? '加入' : '儲存'}
          </button>
        </div>
        {!isNew && entry?.source === 'zone' && (
          <div className="t-tiny" style={{ marginTop: 8, textAlign:'center', opacity: 0.7 }}>
            移除會把該物品的「送出」決定一併取消
          </div>
        )}
      </div>
    </Sheet>
  );
}

const giveInputStyle = {
  width: '100%', padding: '10px 14px',
  border: '0.5px solid var(--border-strong)', borderRadius: 10,
  background: 'var(--card-soft)', fontSize: 14, color: 'var(--text)',
  outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
};

// ───────── SUPPORT (Encouragement + Achievements) ─────────
function SupportScreen({ t, onMenu }) {
  const [tab, setTab] = useStateC('mood');
  const enc = ENCOURAGEMENT[t.encouragement] || ENCOURAGEMENT.warm;
  return (
    <div className="bg-soft-wash" style={{ minHeight:'100%' }}>
      <AppBar title="鼓勵" en="Be kind to yourself"
              left={<button className="icon-btn" onClick={onMenu}><Icon.menu /></button>}/>

      <div className="section-tight">
        <div style={{ display:'flex', gap: 8, marginBottom: 14 }}>
          {[
            { id:'mood', label:'今日心情' },
            { id:'badges', label:'徽章' },
          ].map(opt => (
            <button key={opt.id} className={`btn ${tab === opt.id ? '' : 'btn-secondary'}`}
                    style={{ flex: 1, padding:'8px 12px', fontSize: 13 }}
                    onClick={() => setTab(opt.id)}>
              {opt.label}
            </button>
          ))}
        </div>

        {tab === 'mood' ? <MoodTab enc={enc} t={t} /> : <BadgesTab />}
      </div>
      <div style={{ height: 30 }}></div>
    </div>
  );
}

function MoodTab({ enc, t }) {
  const [mood, setMood] = useStateC(null);
  return (
    <div className="stack-4">
      <div className="card" style={{ textAlign:'center', padding:'28px 18px' }}>
        {t.mascot && <div style={{ marginBottom: 14 }}><Mascot size={68} /></div>}
        <div className="t-tiny" style={{ marginBottom: 6 }}>今天的我</div>
        <div className="h-title" style={{ fontSize: 18, marginBottom: 18 }}>你現在感覺如何？</div>
        <div style={{ display:'flex', justifyContent:'space-between', gap: 6 }}>
          {[
            { e:'🌧️', l:'低落' },
            { e:'😌', l:'平靜' },
            { e:'🌤️', l:'還好' },
            { e:'🌸', l:'有力' },
            { e:'☀️', l:'很好' },
          ].map((m, i) => (
            <button key={i} onClick={() => setMood(i)}
                    style={{ flex:1, background: mood === i ? 'var(--accent-soft)' : 'var(--card-soft)',
                             border: mood === i ? '0.5px solid var(--accent)' : '0.5px solid var(--border)',
                             borderRadius: 14, padding:'12px 4px', cursor:'pointer',
                             display:'flex', flexDirection:'column', gap: 4, alignItems:'center' }}>
              <span style={{ fontSize: 22 }}>{m.e}</span>
              <span className="t-tiny" style={{ fontSize: 10 }}>{m.l}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="h-section" style={{ marginBottom: 10 }}>今天的話 · Daily note</div>
        {enc.map((p, i) => (
          <div key={i} style={{ padding:'10px 0', borderTop: i ? '0.5px solid var(--border)' : '0' }}>
            <div style={{ fontFamily:'var(--font-display)', fontStyle:'italic', fontSize: 15, color:'var(--text-soft)', lineHeight: 1.55 }}>
              『 {p} 』
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="h-section" style={{ marginBottom: 10 }}>釋出回憶 · Released memories</div>
        <div className="stack-3">
          {[
            { item:'童年的明信片', date:'5/04', note:'是阿嬤從鄉下寄來的，她已不在了。我把它拍下來收進雲端。' },
            { item:'前任送的水晶吊飾', date:'4/28', note:'謝謝那段時光教會我的事。' },
            { item:'大學筆記', date:'4/22', note:'那段熬夜的日子很辛苦也很閃亮。' },
          ].map((m, i) => (
            <div key={i} style={{ padding:'10px 0', borderTop: i ? '0.5px solid var(--border)' : 0 }}>
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13, color:'var(--text)', fontWeight: 500 }}>{m.item}</span>
                <span className="t-tiny">{m.date}</span>
              </div>
              <div className="t-small" style={{ fontFamily:'var(--font-display)', fontStyle:'italic', fontSize: 13 }}>{m.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BadgesTab() {
  const earned = BADGES.filter(b => b.earned);
  const locked = BADGES.filter(b => !b.earned);
  return (
    <div className="stack-4">
      <div className="card" style={{ textAlign:'center', padding:'22px 18px' }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div style={{ textAlign:'left' }}>
            <div className="h-section">已獲得</div>
            <div className="h-display" style={{ fontSize: 26, marginTop: 2 }}>{earned.length} <span style={{ fontSize: 14, color:'var(--muted)' }}>/ {BADGES.length}</span></div>
          </div>
          <Icon.trophy style={{ width: 32, height: 32, color:'var(--accent-deep)' }}/>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(earned.length/BADGES.length)*100}%` }}></div>
        </div>
      </div>

      <div>
        <h3 className="h-section" style={{ marginBottom: 10 }}>已獲得 · Earned</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
          {earned.map(b => (
            <div key={b.id} className="card" style={{ padding: 14, textAlign:'center' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{b.icon}</div>
              <div style={{ fontSize: 13, color:'var(--text)', fontWeight: 500 }}>{b.name}</div>
              <div className="t-tiny" style={{ marginTop: 2 }}>{b.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="h-section" style={{ marginBottom: 10 }}>未解鎖 · Locked</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
          {locked.map(b => (
            <div key={b.id} className="card-soft" style={{ padding: 14, textAlign:'center', opacity: 0.55 }}>
              <div style={{ fontSize: 32, marginBottom: 6, filter:'grayscale(1)' }}>{b.icon}</div>
              <div style={{ fontSize: 13, color:'var(--text)', fontWeight: 500 }}>{b.name}</div>
              <div className="t-tiny" style={{ marginTop: 2 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────── REMINDERS sheet/screen ─────────
function RemindersScreen({ onBack }) {
  return (
    <div className="fade-in">
      <AppBar title="行事曆" en="Schedule"
              left={<button className="icon-btn" onClick={onBack}><Icon.back /></button>}
              right={<button className="icon-btn"><Icon.plus /></button>}/>
      <div className="section-tight">
        {/* Mini week strip */}
        <div className="card" style={{ padding:'14px 8px', marginBottom: 14 }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            {[
              { d:'10', w:'日', active:false, dot:false },
              { d:'11', w:'一', active:false, dot:true },
              { d:'12', w:'二', active:true, dot:true },
              { d:'13', w:'三', active:false, dot:true },
              { d:'14', w:'四', active:false, dot:true },
              { d:'15', w:'五', active:false, dot:true },
              { d:'16', w:'六', active:false, dot:false },
            ].map((d, i) => (
              <div key={i} style={{ flex:1, textAlign:'center', padding:'6px 0',
                borderRadius: 12,
                background: d.active ? 'var(--accent-deep)' : 'transparent',
                color: d.active ? '#FFFCF7' : 'var(--text)' }}>
                <div className="t-tiny" style={{ color: d.active ? '#FAEEDB' : 'var(--muted)' }}>{d.w}</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{d.d}</div>
                <div style={{ width: 4, height: 4, borderRadius:'50%',
                  background: d.dot ? (d.active ? '#FAEEDB' : 'var(--accent-deep)') : 'transparent',
                  margin:'4px auto 0' }}></div>
              </div>
            ))}
          </div>
        </div>

        <h3 className="h-section" style={{ marginBottom: 10 }}>排程 · Upcoming</h3>
        <div className="stack-2">
          {SCHEDULE.map((s, i) => (
            <div key={i} className="card" style={{ padding: 14, display:'flex', gap: 12 }}>
              <div style={{ width: 52, textAlign:'center', flexShrink: 0 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight: 500, color: s.state === 'now' ? 'var(--c-discard)' : 'var(--text)' }}>{s.date}</div>
                <div className="t-tiny">{s.day}</div>
              </div>
              <div style={{ width: 0.5, background:'var(--border)' }}></div>
              <div style={{ flex: 1 }}>
                <div className="row-between" style={{ marginBottom: 2 }}>
                  <div style={{ fontSize: 14, color:'var(--text)', fontWeight: 500 }}>{s.zone}</div>
                  {s.state === 'now' && <span className="chip" style={{ background:'var(--c-discard-bg)', color:'var(--c-discard)' }}>現在</span>}
                </div>
                <div className="t-tiny">{s.room} · {s.time} · {s.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 30 }}></div>
    </div>
  );
}

Object.assign(window, { RecordScreen, ListScreen, SupportScreen, RemindersScreen });
