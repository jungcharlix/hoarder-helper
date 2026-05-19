// 囤積症幫手 — Side menu drawer

const { useState: useStateD } = React;

function SideMenu({ open, onClose, onGo, onResetData, t, setTweak, user, userCount }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}></div>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: '78%', maxWidth: 320, background: 'var(--bg)',
        zIndex: 50, padding: '54px 20px 30px',
        boxShadow: '4px 0 30px rgba(0,0,0,0.18)',
        overflowY: 'auto',
        animation: 'slideInLeft 0.28s cubic-bezier(.2,.8,.2,1) both',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 8, cursor:'pointer' }}
             onClick={() => { onClose(); onGo('users'); }}>
          <div style={{ width: 52, height: 52, borderRadius:'50%', background:'var(--accent-soft)',
                        display:'grid', placeItems:'center', fontSize: 28 }}>{user?.emoji || '🌱'}</div>
          <div style={{ flex: 1 }}>
            <div className="h-title" style={{ fontSize: 18 }}>{user?.name || '使用者'}</div>
            <div className="t-tiny">第 {daysSince(user?.joined) + 1} 天 · {userCount > 1 ? `${userCount} 位使用者` : '切換 / 新增 →'}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}><path d="M9 6l6 6-6 6"/></svg>
        </div>

        <div className="divider"></div>

        <div className="stack-2">
          {[
            { id: 'users', label: '使用者', en: 'Profiles & switch', icon: '👤' },
            { id: 'manage', label: '管理空間', en: 'Customize rooms', icon: '🏠' },
            { id: 'reminders', label: '行事曆', en: 'Schedule', icon: '📅' },
            { id: 'export', label: '備份 / 匯入', en: 'Backup & export', icon: '💾' },
          ].map(item => (
            <div key={item.id} className="card-soft" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                 onClick={() => { onClose(); onGo(item.id); }}>
              <div style={{ fontSize: 22 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{item.label}</div>
                <div className="t-tiny">{item.en}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}><path d="M9 6l6 6-6 6"/></svg>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        <div>
          <div className="h-section" style={{ marginBottom: 8 }}>快速設定</div>
          <div className="card-soft" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14 }}>深色模式</div>
              <div className="t-tiny">Dark mode</div>
            </div>
            <button type="button"
                    onClick={() => setTweak('dark', !t.dark)}
                    style={{
                      width: 44, height: 26, borderRadius: 999,
                      background: t.dark ? 'var(--c-give)' : 'rgba(0,0,0,0.15)',
                      border: 0, position: 'relative', cursor: 'pointer',
                    }}>
              <span style={{
                position: 'absolute', top: 3, left: t.dark ? 21 : 3,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }}></span>
            </button>
          </div>
          <div className="card-soft" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14 }}>吉祥物 囤囤</div>
              <div className="t-tiny">Companion</div>
            </div>
            <button type="button"
                    onClick={() => setTweak('mascot', !t.mascot)}
                    style={{
                      width: 44, height: 26, borderRadius: 999,
                      background: t.mascot ? 'var(--c-give)' : 'rgba(0,0,0,0.15)',
                      border: 0, position: 'relative', cursor: 'pointer',
                    }}>
              <span style={{
                position: 'absolute', top: 3, left: t.mascot ? 21 : 3,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }}></span>
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}></div>

        <button className="btn btn-ghost" style={{ fontSize: 12, color:'var(--muted)' }} onClick={() => {
          if (confirm(`將清除「${user?.name || '本使用者'}」的所有資料並恢復為預設。確定嗎？`)) {
            onResetData();
            onClose();
          }
        }}>清除目前使用者的資料</button>
      </div>
    </>
  );
}

window.SideMenu = SideMenu;
