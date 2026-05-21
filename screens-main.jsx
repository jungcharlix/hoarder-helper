// 囤積症幫手 — Home, Map, Record screens

const { useState: useStateA, useMemo: useMemoA } = React;

// ───────── HOME ─────────
function HomeScreen({ t, setTweak, onGo, onStartZone, onOpenZone, onMenu, rooms, user }) {
  const today = SCHEDULE[0];
  const tomorrow = SCHEDULE[1];
  const enc = ENCOURAGEMENT[t.encouragement] || ENCOURAGEMENT.warm;
  const [phrase] = useStateA(enc[Math.floor(Math.random() * enc.length)]);
  const [editingGoal, setEditingGoal] = useStateA(false);

  const allRooms = rooms || window.ROOMS || ROOMS;

  // Find today's active zone — first zone that's not complete
  let activeRoom = null, activeZone = null;
  for (const r of allRooms) {
    for (const z of r.zones) {
      const decided = (z.itemList || []).filter(it => it.decision).length;
      const total = (z.itemList || []).length;
      if (total > 0 && decided < total) {
        activeRoom = r; activeZone = z;
        break;
      }
    }
    if (activeZone) break;
  }
  if (!activeZone) {
    activeRoom = allRooms[0];
    activeZone = allRooms[0].zones[0];
  }
  const zoneDecided = (activeZone.itemList || []).filter(it => it.decision).length;
  const zoneTotal = (activeZone.itemList || []).length;

  const decidedToday = allRooms.reduce((s, r) =>
    s + r.zones.reduce((zs, z) =>
      zs + (z.itemList || []).filter(it => it.decision).length, 0), 0);

  const totalItems = ROOMS.reduce((s,r) => s + r.totalItems, 0);
  const totalDecided = ROOMS.reduce((s,r) => s + r.totalDecided, 0);
  const completedZones = ROOMS.reduce((s,r) => s + r.completedZones, 0);
  const pct = totalDecided / totalItems;

  return (
    <div>
      <AppBar
        title={`哈囉，${user?.name || ''}`}
        en="Take it slow"
        left={<button className="icon-btn" onClick={onMenu}><Icon.menu /></button>}
        right={<button className="icon-btn" onClick={() => onGo('reminders')}><Icon.bell /></button>}
      />

      {/* Encouragement */}
      <div className="section-tight fade-in">
        <div className="encourage">
          {t.mascot && <Mascot size={48} enabled={t.mascot} />}
          <div className="quote">『 {phrase} 』</div>
        </div>
      </div>

      {/* Today's task */}
      <div className="section fade-in" style={{ paddingTop: 18 }}>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <h3 className="h-section">今日任務 · Today</h3>
          <span className="t-tiny">5/12 · 週二</span>
        </div>
        <div className="card" style={{ padding: 0, overflow:'hidden' }}>
          <div style={{ padding:'18px 18px 14px', display:'flex', gap: 14, alignItems:'center' }}>
            <ProgressRing size={76} stroke={5} value={Math.min(1, decidedToday / t.dailyGoal)} color="var(--accent-deep)">
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight:500, color:'var(--text)' }}>{decidedToday}</div>
                <div className="t-tiny" style={{ marginTop: -2 }}>/ {t.dailyGoal}</div>
              </div>
            </ProgressRing>
            <div style={{ flex: 1 }}>
              <div className="t-tiny" style={{ marginBottom: 2 }}>{activeRoom.name} · {(activeRoom.enName || '').toUpperCase()}</div>
              <div className="h-title">{activeZone.name}</div>
              <div className="t-small" style={{ marginTop: 4 }}>
                此區 <b style={{ color:'var(--text)' }}>{zoneDecided}/{zoneTotal}</b> ·{' '}
                <span style={{ cursor:'pointer', color:'var(--accent-deep)', textDecoration:'underline', textDecorationStyle:'dotted', textUnderlineOffset:'3px' }}
                      onClick={() => setEditingGoal(true)}>目標 {t.dailyGoal}</span>
              </div>
            </div>
          </div>
          {/* Mini progress for the zone */}
          <div style={{ padding:'0 18px 10px' }}>
            <div className="progress-track" style={{ height: 3 }}>
              <div className="progress-fill" style={{ width: `${zoneTotal ? (zoneDecided/zoneTotal)*100 : 0}%` }}></div>
            </div>
          </div>
          <div style={{ padding:'0 18px 18px', display:'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onGo('reminders')}>稍後</button>
            <button className="btn" style={{ flex: 2 }} onClick={() => onOpenZone(activeZone.id)}>
              繼續整理
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {editingGoal && (
        <Sheet open={true} onClose={() => setEditingGoal(false)}>
          <div style={{ padding:'4px 4px 4px' }}>
            <div className="h-title" style={{ fontSize: 19, marginBottom: 4 }}>今日任務目標</div>
            <div className="t-small" style={{ marginBottom: 18, textWrap:'pretty' }}>
              設定今天想處理多少件物品。可以從少量開始，慢慢來。
            </div>
            <div style={{ textAlign:'center', marginBottom: 16 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 48, fontWeight: 500, color:'var(--text)', lineHeight: 1 }}>
                {t.dailyGoal}
              </div>
              <div className="t-tiny" style={{ marginTop: 4 }}>件 · per day</div>
            </div>
            <input type="range" min="5" max="60" step="5" value={t.dailyGoal}
                   onChange={(e) => setTweak('dailyGoal', Number(e.target.value))}
                   style={{ width:'100%', accentColor:'var(--accent-deep)', marginBottom: 14 }}/>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 18 }}>
              {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                <button key={n} onClick={() => setTweak('dailyGoal', n)}
                        className="chip"
                        style={{
                          padding:'8px 14px', cursor:'pointer',
                          background: t.dailyGoal === n ? 'var(--accent-soft)' : 'var(--card-soft)',
                          color: t.dailyGoal === n ? 'var(--accent-deep)' : 'var(--muted)',
                          border:'0.5px solid ' + (t.dailyGoal === n ? 'var(--accent)' : 'var(--border)'),
                          fontSize: 13,
                        }}>{n}</button>
              ))}
            </div>
            <button className="btn btn-block" onClick={() => setEditingGoal(false)}>完成</button>
          </div>
        </Sheet>
      )}

      {/* Overall progress */}
      <div className="section">
        <h3 className="h-section" style={{ marginBottom: 10 }}>整體進度 · Progress</h3>
        <div className="card">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div>
              <div className="h-display" style={{ fontSize: 32 }}>{Math.round(pct * 100)}<span style={{ fontSize: 18, color:'var(--muted)' }}>%</span></div>
              <div className="t-small">家裡已決定的物品比例</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="h-title" style={{ fontSize: 18 }}>{completedZones}<span className="t-small"> / {ALL_ZONES_COUNT}</span></div>
              <div className="t-tiny">完成區域</div>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct*100}%` }}></div>
          </div>
          <div className="row-between" style={{ marginTop: 10 }}>
            <div className="t-small">{totalDecided.toLocaleString()} 件 已決定</div>
            <div className="t-tiny">共 {totalItems.toLocaleString()} 件</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="section">
        <h3 className="h-section" style={{ marginBottom: 10 }}>接下來 · Up next</h3>
        <div className="stack-2">
          <div className="card-soft row-between" onClick={() => onGo('reminders')}>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background:'var(--accent-soft)', display:'grid', placeItems:'center', color:'var(--accent-deep)' }}><Icon.bell /></div>
              <div>
                <div style={{ fontSize: 14, color:'var(--text)' }}>{tomorrow.zone}</div>
                <div className="t-tiny">{tomorrow.date} {tomorrow.day} · {tomorrow.time}</div>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}><path d="M9 6l6 6-6 6"/></svg>
          </div>
          <div className="card-soft row-between" onClick={() => onGo('list')}>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background:'var(--c-give-bg)', display:'grid', placeItems:'center', color:'var(--c-give)' }}><Icon.gift /></div>
              <div>
                <div style={{ fontSize: 14, color:'var(--text)' }}>3 件物品等待送出</div>
                <div className="t-tiny">最近一件：5/14 香氛蠟燭</div>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="section">
        <h3 className="h-section" style={{ marginBottom: 10 }}>本週統計 · This week</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8 }}>
          {[
            { v: '82', l: '件已決定' },
            { v: '4', l: '區完成' },
            { v: '7', l: '日連線' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding:'14px 10px', textAlign:'center' }}>
              <div className="h-display" style={{ fontSize: 24 }}>{s.v}</div>
              <div className="t-tiny" style={{ marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 30 }}></div>
    </div>
  );
}

// ───────── MAP (Floor plan) ─────────
function MapScreen({ onPickRoom, onManage, onMenu }) {
  // Floor plan: a vertical 3-col stack of rooms in physical-ish arrangement.
  return (
    <div>
      <AppBar
        title="房間地圖"
        en="Floor plan"
        left={<button className="icon-btn" onClick={onMenu}><Icon.menu /></button>}
        right={<button className="icon-btn" onClick={onManage} title="管理空間"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></button>}
      />
      <div className="section-tight">
        <div className="t-small" style={{ marginBottom: 10 }}>
          總共 <b style={{ color:'var(--text)' }}>{ALL_ZONES_COUNT}</b> 個小區域 · <span style={{ color:'var(--c-give)' }}>已完成 {ROOMS.reduce((s,r)=>s+r.completedZones,0)}</span>
        </div>
        <div className="floor">
          {ROOMS.map(room => {
            const isDone = room.completedZones === room.totalZones;
            const isActive = room.id === 'living';
            return (
              <div key={room.id}
                   className={`room-card ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                   style={{
                     gridColumn: `${room.layout.col} / span ${room.layout.w}`,
                     gridRow: `${room.layout.row} / span ${room.layout.h}`,
                     minHeight: room.layout.h > 1 ? 110 : 78,
                   }}
                   onClick={() => onPickRoom(room.id)}>
                <div>
                  <div className="room-name">{room.name}</div>
                  <div className="room-en">{room.enName}</div>
                </div>
                <div>
                  <div className="room-zones-mini">
                    {room.zones.map((z, i) => {
                      let cls = '';
                      if (z.decided === 0) cls = '';
                      else if (z.decided >= z.items) cls = 'done';
                      else cls = 'partial';
                      if (z.id === 'living-3') cls = 'now';
                      return <span key={i} className={`zone-pip ${cls}`}></span>;
                    })}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6 }}>
                    <span className="t-tiny" style={{ fontSize: 9 }}>{room.completedZones}/{room.totalZones} 區</span>
                    <span className="t-tiny" style={{ fontSize: 9, fontVariantNumeric:'tabular-nums' }}>{Math.round(room.totalDecided/room.totalItems*100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="section-tight" style={{ marginTop: 6 }}>
        <div className="card-soft" style={{ display:'flex', gap: 14, justifyContent:'center' }}>
          <div className="row" style={{ gap: 5 }}><span className="zone-pip"></span><span className="t-tiny">未開始</span></div>
          <div className="row" style={{ gap: 5 }}><span className="zone-pip partial"></span><span className="t-tiny">進行中</span></div>
          <div className="row" style={{ gap: 5 }}><span className="zone-pip done"></span><span className="t-tiny">完成</span></div>
          <div className="row" style={{ gap: 5 }}><span className="zone-pip now"></span><span className="t-tiny">今日</span></div>
        </div>
      </div>
      <div style={{ height: 30 }}></div>
    </div>
  );
}

// ───────── ROOM DETAIL — zone list ─────────
function RoomScreen({ roomId, onBack, onStartZone }) {
  const room = ROOMS.find(r => r.id === roomId);
  if (!room) return null;
  return (
    <div className="fade-in">
      <AppBar
        title={room.name}
        en={room.enName}
        left={<button className="icon-btn" onClick={onBack}><Icon.back /></button>}
      />
      <div className="section-tight">
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row-between">
            <div>
              <div className="t-tiny">完成度</div>
              <div className="h-display" style={{ fontSize: 30, marginTop: 2 }}>
                {Math.round(room.totalDecided/room.totalItems*100)}<span style={{ fontSize: 16, color:'var(--muted)' }}>%</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="t-small">{room.completedZones} / {room.totalZones} 區完成</div>
              <div className="t-tiny">{room.totalDecided} / {room.totalItems} 件</div>
            </div>
          </div>
          <div className="progress-track" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${room.totalDecided/room.totalItems*100}%` }}></div>
          </div>
        </div>

        <h3 className="h-section" style={{ marginBottom: 10 }}>區域 · {room.totalZones} Zones</h3>
        {room.zones.length > 12 ? (
          // Storage grid view
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 6 }}>
            {room.zones.map((z, i) => {
              const pct = z.decided / z.items;
              const cls = pct >= 1 ? 'done' : pct > 0 ? 'partial' : '';
              return (
                <div key={z.id} className="card" style={{ padding: 10, textAlign:'center', cursor:'pointer' }} onClick={() => onStartZone(z.id)}>
                  <div className="t-tiny" style={{ fontSize: 9 }}>第 {i+1} 區</div>
                  <div style={{ fontSize: 12, color:'var(--text)', margin:'4px 0', fontWeight:500 }}>{z.items}</div>
                  <div className="progress-track" style={{ height: 3 }}>
                    <div className={`progress-fill ${cls === 'done' ? 'success' : ''}`} style={{ width: `${pct*100}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {room.zones.map((z, i) => {
              const pct = z.decided / z.items;
              const done = pct >= 1;
              return (
                <div key={z.id} className="zone-row" onClick={() => onStartZone(z.id)}>
                  <div className="marker" style={{ background: done ? 'var(--c-give-bg)' : pct > 0 ? 'var(--accent-soft)' : 'var(--bg-soft)' , color: done ? 'var(--c-give)' : pct > 0 ? 'var(--accent-deep)' : 'var(--muted)' }}>
                    {done ? <Icon.check /> : (i + 1)}
                  </div>
                  <div className="info">
                    <div className="top">
                      <div className="name">{z.name}</div>
                      <div className={`pct ${done ? 'done' : ''}`}>{z.decided} / {z.items}</div>
                    </div>
                    <div className="progress-track" style={{ marginTop: 6, height: 4 }}>
                      <div className={`progress-fill ${done ? 'success' : ''}`} style={{ width: `${pct*100}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ height: 30 }}></div>
    </div>
  );
}

Object.assign(window, { HomeScreen, MapScreen, RoomScreen });
