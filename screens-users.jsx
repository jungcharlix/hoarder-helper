// 囤積症幫手 — 使用者切換與匯出入畫面

const { useState: useStateU } = React;

// ──────── 使用者管理 ────────
function UsersScreen({ users, setUsers, activeUserId, onSwitch, onBack }) {
  const [editing, setEditing] = useStateU(null); // user obj or 'new'
  const [confirmDelete, setConfirmDelete] = useStateU(null);

  return (
    <div className="fade-in">
      <AppBar title="使用者"
              en="Profiles"
              left={<button className="icon-btn" onClick={onBack}><Icon.back/></button>}
              right={<button className="icon-btn" onClick={() => setEditing('new')}><Icon.plus/></button>}/>

      <div className="section-tight">
        <div className="card-soft" style={{ marginBottom: 14 }}>
          <div className="t-small" style={{ textWrap:'pretty' }}>
            可以為同住者或家中成員建立各自的整理空間。每位使用者的資料完全獨立，可分別匯出備份。
          </div>
        </div>

        <h3 className="h-section" style={{ marginBottom: 10 }}>{users.length} 位使用者</h3>
        <div className="stack-2">
          {users.map(u => (
            <div key={u.id}
                 className={`card ${activeUserId === u.id ? '' : ''}`}
                 style={{
                   padding: 14,
                   display:'flex', alignItems:'center', gap: 12,
                   borderColor: activeUserId === u.id ? 'var(--accent)' : 'var(--border)',
                   background: activeUserId === u.id ? 'var(--accent-soft)' : 'var(--card)',
                 }}>
              <div style={{
                width: 52, height: 52, borderRadius:'50%',
                background:'var(--card-soft)',
                display:'grid', placeItems:'center', fontSize: 28,
                flexShrink: 0,
              }}>{u.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 16, color:'var(--text)', fontWeight: 500 }}>{u.name}</span>
                  {activeUserId === u.id && <span className="chip chip-accent" style={{ fontSize: 10 }}>使用中</span>}
                </div>
                <div className="t-tiny">
                  加入 {u.joined} · 第 {daysSince(u.joined) + 1} 天
                </div>
              </div>
              <div className="row" style={{ gap: 4 }}>
                {activeUserId !== u.id && (
                  <button className="btn btn-secondary" style={{ padding:'6px 10px', fontSize: 12 }}
                          onClick={() => onSwitch(u.id)}>
                    切換
                  </button>
                )}
                <button className="icon-btn" style={{ width: 32, height: 32 }}
                        onClick={() => setEditing(u)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L8 22H2v-6L14 4z"/></svg>
                </button>
                {users.length > 1 && (
                  <button className="icon-btn" style={{ width: 32, height: 32, color:'var(--c-discard)' }}
                          onClick={() => setConfirmDelete(u)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }}
                onClick={() => setEditing('new')}>
          <Icon.plus style={{ width:16, height:16 }}/> 新增使用者
        </button>
      </div>

      {editing && <EditUserSheet
        user={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (editing === 'new') {
            const id = `u-${Date.now()}`;
            const today = new Date().toISOString().slice(0, 10);
            const fresh = seedFreshUser();
            saveUserRooms(id, fresh.rooms);
            saveUserGiveaways(id, fresh.giveaways);
            const newUser = { id, joined: today, ...patch };
            setUsers([...users, newUser]);
          } else {
            setUsers(users.map(u => u.id === editing.id ? { ...u, ...patch } : u));
          }
          setEditing(null);
        }}/>}

      {confirmDelete && (
        <Sheet open={true} onClose={() => setConfirmDelete(null)}>
          <div style={{ textAlign:'center', padding:'8px 4px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>⚠️</div>
            <div className="h-title" style={{ fontSize: 18, marginBottom: 6 }}>刪除使用者「{confirmDelete.name}」？</div>
            <div className="t-small" style={{ marginBottom: 16, textWrap:'pretty' }}>
              這位使用者的所有空間、物品、決定、送養紀錄都會一併刪除，無法復原。<br/>
              建議先匯出備份再刪除。
            </div>
            <div style={{ display:'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="btn" style={{ flex: 1, background:'var(--c-discard)' }}
                      onClick={() => {
                        deleteUserData(confirmDelete.id);
                        const remaining = users.filter(u => u.id !== confirmDelete.id);
                        setUsers(remaining);
                        if (activeUserId === confirmDelete.id && remaining[0]) {
                          onSwitch(remaining[0].id);
                        }
                        setConfirmDelete(null);
                      }}>刪除</button>
            </div>
          </div>
        </Sheet>
      )}
      <div style={{ height: 30 }}></div>
    </div>
  );
}

function EditUserSheet({ user, onClose, onSave }) {
  const [name, setName] = useStateU(user?.name || '');
  const [emoji, setEmoji] = useStateU(user?.emoji || '🌱');
  const emojiSet = ['🌱','🌸','🌿','🍀','🌳','🌷','🌼','🌻','🦊','🐱','🐰','🦁','🐻','🐼','🦋','🐝','🌙','☀️','⭐','✨','💫','🍃','🪴','🎋'];
  return (
    <Sheet open={true} onClose={onClose}>
      <div style={{ padding:'4px 4px 0' }}>
        <div className="h-title" style={{ fontSize: 19, marginBottom: 4 }}>{user ? '編輯使用者' : '新增使用者'}</div>
        <div className="t-small" style={{ marginBottom: 18 }}>
          {user ? '更新個人資料。' : '為新成員建立獨立的整理空間。'}
        </div>

        <div className="t-tiny" style={{ marginBottom: 6 }}>頭像</div>
        <div style={{ display:'flex', gap: 4, flexWrap:'wrap', marginBottom: 14, maxHeight: 110, overflowY:'auto' }}>
          {emojiSet.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
                    style={{ width: 38, height: 38, fontSize: 22, lineHeight: 1, cursor:'pointer', borderRadius: 10,
                      border: emoji === e ? '1.5px solid var(--accent-deep)' : '0.5px solid var(--border)',
                      background: emoji === e ? 'var(--accent-soft)' : 'var(--card-soft)' }}>{e}</button>
          ))}
        </div>

        <div className="t-tiny" style={{ marginBottom: 6 }}>名稱 *</div>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
               placeholder="想被稱呼的名字"
               style={{
                 width:'100%', padding:'12px 14px', border:'0.5px solid var(--border-strong)',
                 borderRadius: 12, background:'var(--card-soft)', fontSize: 15,
                 color:'var(--text)', outline:'none', fontFamily:'var(--font-body)',
                 boxSizing:'border-box',
               }}/>

        <div style={{ display:'flex', gap: 10, marginTop: 22 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
          <button className="btn" style={{ flex: 2 }} disabled={!name.trim()}
                  onClick={() => name.trim() && onSave({ name: name.trim(), emoji })}>
            {user ? '儲存' : '建立'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { UsersScreen });
