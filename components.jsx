// 囤積症幫手 — shared components

const { useState, useEffect, useRef, useMemo } = React;

// ───────── Mascot — "囤囤" (simple round blob, only basic shapes) ─────────
function Mascot({ size = 56, mood = 'happy', enabled = true }) {
  if (!enabled) return null;
  const eyeY = size * 0.46;
  const eyeOff = size * 0.18;
  const eyeR = size * 0.045;
  return (
    <div className="mascot" style={{ width: size, height: size }}>
      <div className="mascot-body" style={{ width: size, height: size }}></div>
      {/* eyes */}
      <div className="mascot-eye" style={{ width: eyeR*2, height: eyeR*2, left: size/2 - eyeOff - eyeR, top: eyeY }}></div>
      <div className="mascot-eye" style={{ width: eyeR*2, height: eyeR*2, left: size/2 + eyeOff - eyeR, top: eyeY }}></div>
      {/* cheeks */}
      <div style={{ position:'absolute', width: size*0.10, height: size*0.06, background:'#E8A99B', borderRadius:'50%', left: size*0.20, top: size*0.58, opacity:0.7 }}></div>
      <div style={{ position:'absolute', width: size*0.10, height: size*0.06, background:'#E8A99B', borderRadius:'50%', right: size*0.20, top: size*0.58, opacity:0.7 }}></div>
      {/* mouth */}
      <div style={{
        position:'absolute', left:'50%', top: size*0.62,
        width: size*0.14, height: size*0.08,
        borderBottom: `1.5px solid #3A2E26`, borderRadius: '0 0 50% 50%',
        transform:'translateX(-50%)',
      }}></div>
    </div>
  );
}

// ───────── Status bar (custom, themed) ─────────
function StatusBar({ time = '20:14', dark }) {
  const c = dark ? '#EDE2D0' : '#3A2E26';
  return (
    <div className="status-bar">
      <span style={{ color: c }}>{time}</span>
      <div className="icons">
        <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="6" width="3" height="5" rx="0.5" fill={c}/><rect x="4.3" y="4" width="3" height="7" rx="0.5" fill={c}/><rect x="8.6" y="2" width="3" height="9" rx="0.5" fill={c}/><rect x="12.9" y="0" width="3" height="11" rx="0.5" fill={c}/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke={c} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="13" height="7" rx="1.2" fill={c}/></svg>
      </div>
    </div>
  );
}

// ───────── App bar ─────────
function AppBar({ title, en, right, left, sub }) {
  return (
    <div className="app-bar">
      <div style={{ width: 38 }}>{left}</div>
      <div style={{ textAlign:'center', flex: 1 }}>
        <div className="app-bar-title">{title}</div>
        {en && <div className="app-bar-en">{en}</div>}
        {sub && <div className="t-small" style={{ marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ width: 38, display:'flex', justifyContent:'flex-end' }}>{right}</div>
    </div>
  );
}

// ───────── Icons ─────────
const Icon = {
  home: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l9-8 9 8"/><path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5"/></svg>,
  map: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16M3 10h18M3 16h18"/></svg>,
  history: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  gift: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 13h18M12 8v13M9 5a2 2 0 014 2 2 2 0 014-2"/></svg>,
  heart: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6.5 5.5 5.5 0 0121.5 12c-2.5 4.5-9.5 9-9.5 9z"/></svg>,
  bell: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z"/><path d="M10 20a2 2 0 004 0"/></svg>,
  menu: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
  back: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 6l-6 6 6 6"/></svg>,
  check: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>,
  x: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  plus: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  pause: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>,
  leaf: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 19c0-8 7-14 16-14 0 9-6 16-14 16a2 2 0 01-2-2zM5 19l8-8"/></svg>,
  trophy: (p={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 4h10v4a5 5 0 11-10 0V4z"/><path d="M5 6H3v2a3 3 0 003 3M19 6h2v2a3 3 0 01-3 3M9 18h6M12 14v4"/></svg>,
};

// ───────── Bottom Navigation ─────────
function BottomNav({ tab, onTab }) {
  const items = [
    { id: 'home', label: '首頁', icon: Icon.home },
    { id: 'map', label: '地圖', icon: Icon.map },
    { id: 'list', label: '送養', icon: Icon.gift },
    { id: 'record', label: '紀錄', icon: Icon.history },
    { id: 'support', label: '鼓勵', icon: Icon.heart },
  ];
  return (
    <div className="bottom-nav">
      {items.map(it => (
        <div key={it.id} className={`nav-item ${tab === it.id ? 'active' : ''}`} onClick={() => onTab(it.id)}>
          <it.icon />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ───────── Progress ring ─────────
function ProgressRing({ size = 92, stroke = 6, value = 0.4, color = 'var(--accent)', track = 'var(--border)', children }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={C} strokeDashoffset={C * (1 - value)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center' }}>{children}</div>
    </div>
  );
}

// ───────── Bottom Sheet ─────────
function Sheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}></div>
      <div className="sheet">
        <div className="sheet-handle"></div>
        {children}
      </div>
    </>
  );
}

Object.assign(window, { Mascot, StatusBar, AppBar, Icon, BottomNav, ProgressRing, Sheet });
