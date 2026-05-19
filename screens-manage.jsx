// 囤積症幫手 — 管理空間 & 區域

const { useState: useStateM } = React;

function ManageScreen({ rooms, setRooms, onBack }) {
  const [editing, setEditing] = useStateM(null); // room id or 'new'
  const [confirmDelete, setConfirmDelete] = useStateM(null);

  const updateRoom = (id, patch) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const setZoneCount = (id, n) => {
    setRooms(rooms.map(r => {
      if (r.id !== id) return r;
      const cur = r.zones || [];
      let zones = cur.slice(0, n);
      while (zones.length < n) {
        const i = zones.length;
        const zoneId = `${id}-${i+1}-${Date.now()+i}`;
        const zname = r.zones.length > 12 ? `第 ${i+1} 區` : `區域 ${i+1}`;
        zones.push({
          id: zoneId, name: zname,
          items: 20, decided: 0,
          itemList: seedItemsForZone(r.name, zname, 20),
        });
      }
      return { ...r, zones };
    }));
  };

  const addRoom = (name, zoneCount) => {
    const id = `custom-${Date.now()}`;
    const zones = Array.from({ length: zoneCount }, (_, i) => {
      const zoneId = `${id}-${i+1}`;
      const zname = zoneCount > 12 ? `第 ${i+1} 區` : `區域 ${i+1}`;
      return {
        id: zoneId, name: zname,
        items: 20, decided: 0,
        itemList: seedItemsForZone(name, zname, 20),
      };
    });
    // place after existing rooms — fill in available space, simple layout
    const lastRow = Math.max(...rooms.map(r => r.layout.row + r.layout.h - 1), 0);
    setRooms([...rooms, {
      id, name, enName: 'Custom',
      layout: { col: 1, row: lastRow + 1, w: 3, h: 1 },
      zones,
    }]);
    setEditing(null);
  };

  const deleteRoom = (id) => {
    setRooms(rooms.filter(r => r.id !== id));
    setConfirmDelete(null);
  };

  const resetAll = () => {
    if (confirm('將恢復為預設的 10 個房間 / 47 個區域。確定嗎？')) {
      setRooms(JSON.parse(JSON.stringify(DEFAULT_ROOMS)));
    }
  };

  return (
    <div className="fade-in">
      <AppBar
        title="管理空間"
        en="Customize your home"
        left={<button className="icon-btn" onClick={onBack}><Icon.back /></button>}
        right={<button className="icon-btn" onClick={() => setEditing('new')}><Icon.plus /></button>}
      />

      <div className="section-tight">
        <div className="card-soft" style={{ marginBottom: 14 }}>
          <div className="t-small" style={{ textWrap: 'pretty' }}>
            按照家裡實際的格局調整。每個空間可以再切成幾個小區域，<b style={{ color:'var(--text)' }}>每次只整理一個小區域</b>，比較不會有壓力感。
          </div>
        </div>

        <div className="row-between" style={{ marginBottom: 10 }}>
          <h3 className="h-section">空間 · {rooms.length} Rooms</h3>
          <span className="t-tiny">共 {rooms.reduce((s,r)=>s+r.zones.length,0)} 區</span>
        </div>

        <div className="stack-2">
          {rooms.map(room => (
            <div key={room.id} className="card" style={{ padding: 14 }}>
              <div className="row-between" style={{ marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                    style={{
                      border: 0, background: 'transparent', padding: 0,
                      fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
                      color: 'var(--text)', width: '100%', outline: 'none',
                    }}/>
                  <input
                    value={room.enName || ''}
                    placeholder="English name"
                    onChange={(e) => updateRoom(room.id, { enName: e.target.value })}
                    style={{
                      border: 0, background: 'transparent', padding: 0,
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 11,
                      color: 'var(--muted-soft)', width: '100%', outline: 'none', marginTop: 2,
                    }}/>
                </div>
                <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setConfirmDelete(room.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
                </button>
              </div>

              <div className="row-between" style={{ marginTop: 10 }}>
                <span className="t-tiny">區域數量 Zones</span>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    onClick={() => setZoneCount(room.id, Math.max(1, room.zones.length - 1))}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '0.5px solid var(--border-strong)', background: 'var(--card-soft)', color: 'var(--text)', fontSize: 16, cursor: 'pointer' }}>−</button>
                  <div style={{ minWidth: 30, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text)' }}>{room.zones.length}</div>
                  <button
                    onClick={() => setZoneCount(room.id, Math.min(50, room.zones.length + 1))}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '0.5px solid var(--border-strong)', background: 'var(--card-soft)', color: 'var(--text)', fontSize: 16, cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Quick presets */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {[1, 2, 4, 5, 8, 12, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setZoneCount(room.id, n)}
                    className="chip"
                    style={{
                      background: room.zones.length === n ? 'var(--accent-soft)' : 'var(--card-soft)',
                      color: room.zones.length === n ? 'var(--accent-deep)' : 'var(--muted)',
                      cursor: 'pointer', border: '0.5px solid ' + (room.zones.length === n ? 'var(--accent)' : 'var(--border)'),
                    }}>
                    {n} 區
                  </button>
                ))}
              </div>

              {/* Zone name editor — collapsible */}
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--muted)', listStyle: 'none' }}>
                  ▸ 編輯區域名稱
                </summary>
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: room.zones.length > 6 ? '1fr 1fr' : '1fr', gap: 6 }}>
                  {room.zones.map((z, i) => (
                    <input
                      key={z.id}
                      value={z.name}
                      onChange={(e) => {
                        const newZones = room.zones.map((zz, j) => j === i ? { ...zz, name: e.target.value } : zz);
                        updateRoom(room.id, { zones: newZones });
                      }}
                      style={{
                        border: '0.5px solid var(--border)', borderRadius: 8,
                        padding: '6px 10px', background: 'var(--card-soft)',
                        fontSize: 12, color: 'var(--text)', outline: 'none',
                        fontFamily: 'var(--font-body)',
                      }}/>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>

        <button
          className="btn btn-secondary btn-block"
          style={{ marginTop: 14, gap: 6 }}
          onClick={() => setEditing('new')}>
          <Icon.plus style={{ width: 16, height: 16 }}/> 新增空間
        </button>

        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 6, fontSize: 12 }}
          onClick={resetAll}>
          恢復預設配置
        </button>
      </div>

      {editing === 'new' && <NewRoomSheet onAdd={addRoom} onClose={() => setEditing(null)} />}
      {confirmDelete && (
        <Sheet open={true} onClose={() => setConfirmDelete(null)}>
          <div style={{ textAlign: 'center', padding: '8px 4px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🗑️</div>
            <div className="h-title" style={{ fontSize: 18, marginBottom: 6 }}>確定要刪除這個空間？</div>
            <div className="t-small" style={{ marginBottom: 16, textWrap: 'pretty' }}>
              「{rooms.find(r => r.id === confirmDelete)?.name}」<br/>
              已記錄的進度也會一起移除。
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="btn" style={{ flex: 1, background: 'var(--c-discard)' }} onClick={() => deleteRoom(confirmDelete)}>刪除</button>
            </div>
          </div>
        </Sheet>
      )}
      <div style={{ height: 30 }}></div>
    </div>
  );
}

function NewRoomSheet({ onAdd, onClose }) {
  const [name, setName] = useStateM('');
  const [zones, setZones] = useStateM(2);
  const presets = [
    { name: '客廳', n: 4 }, { name: '臥室', n: 4 },
    { name: '浴室', n: 1 }, { name: '廚房', n: 2 },
    { name: '書房', n: 4 }, { name: '陽台', n: 5 },
    { name: '倉庫', n: 20 },
  ];
  return (
    <Sheet open={true} onClose={onClose}>
      <div style={{ padding: '4px 4px 0' }}>
        <div className="h-title" style={{ fontSize: 19, marginBottom: 4 }}>新增空間</div>
        <div className="t-small" style={{ marginBottom: 16 }}>給它一個名字，再決定要分幾個小區域。</div>

        <div className="t-tiny" style={{ marginBottom: 6 }}>空間名稱</div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：書房、儲藏室"
          style={{
            width: '100%', padding: '12px 14px',
            border: '0.5px solid var(--border-strong)', borderRadius: 12,
            background: 'var(--card-soft)', fontSize: 15, color: 'var(--text)',
            outline: 'none', fontFamily: 'var(--font-body)', marginBottom: 14, boxSizing: 'border-box',
          }}/>

        <div className="t-tiny" style={{ marginBottom: 6 }}>常見類型</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {presets.map(p => (
            <button
              key={p.name}
              className="chip"
              style={{ background: 'var(--card-soft)', cursor: 'pointer', padding: '6px 12px' }}
              onClick={() => { setName(p.name); setZones(p.n); }}>
              {p.name}<span style={{ opacity: 0.5, marginLeft: 4 }}>· {p.n}</span>
            </button>
          ))}
        </div>

        <div className="row-between" style={{ marginBottom: 10 }}>
          <span className="t-tiny">分幾個區域</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>{zones}</span>
        </div>
        <input
          type="range" min="1" max="30" value={zones}
          onChange={(e) => setZones(Number(e.target.value))}
          style={{ width: '100%', marginBottom: 22, accentColor: 'var(--accent-deep)' }}/>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
          <button className="btn" style={{ flex: 2 }} disabled={!name.trim()}
                  onClick={() => name.trim() && onAdd(name.trim(), zones)}>
            建立
          </button>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { ManageScreen });
