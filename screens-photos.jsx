// 囤積症幫手 — 空間照片：整理歷程 (before/after)

const { useState: useStateP, useRef: useRefP } = React;

// Resize image to max ~800px on longest side, save as JPEG dataURL
function resizeImage(file, maxDim = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()}`;
}
function fmtTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('zh-TW', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ───────── Add photo button (camera input) ─────────
function AddPhotoButton({ onAdd, label = '加入照片', small }) {
  const fileRef = useRefP(null);
  const [busy, setBusy] = useStateP(false);
  const onPick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImage(f);
      onAdd({
        id: `ph-${Date.now()}`,
        dataUrl, ts: Date.now(), note: '',
      });
    } catch (err) {
      alert('讀取相片失敗：' + err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
             onChange={onPick} style={{ display:'none' }}/>
      <button
        className={small ? 'icon-btn' : 'btn'}
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        style={small ? { width: 32, height: 32 } : {}}
        title={label}>
        {busy ? '⋯' : small ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {label}
          </>
        )}
      </button>
    </>
  );
}

// ───────── Photo strip — small thumbnails for a zone ─────────
function PhotoStrip({ photos, onTap, onAdd }) {
  const list = photos || [];
  return (
    <div style={{ display:'flex', gap: 6, overflowX:'auto', padding:'2px 0', marginBottom: 4 }}>
      {list.map((p, i) => (
        <div key={p.id} onClick={() => onTap(i)}
             style={{ flexShrink: 0, position:'relative', width: 64, height: 64, borderRadius: 10, overflow:'hidden', cursor:'pointer', border:'0.5px solid var(--border)' }}>
          <img src={p.dataUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          <div style={{ position:'absolute', bottom: 0, left: 0, right: 0, padding:'2px 4px',
            background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', color:'#fff', fontSize: 9, textAlign:'right' }}>
            {fmtDate(p.ts)}
          </div>
        </div>
      ))}
      {onAdd && (
        <div style={{ flexShrink: 0 }}>
          <AddPhotoButton onAdd={onAdd} small/>
        </div>
      )}
      {list.length === 0 && !onAdd && (
        <div className="t-tiny" style={{ padding:'18px 0' }}>尚無照片</div>
      )}
    </div>
  );
}

// ───────── Photo Lightbox / Compare ─────────
function PhotoLightbox({ photos, startIdx = 0, zoneName, onClose, onDelete, onUpdate }) {
  const [idx, setIdx] = useStateP(startIdx);
  const [compareIdx, setCompareIdx] = useStateP(null);
  const [editingNote, setEditingNote] = useStateP(false);
  const [noteDraft, setNoteDraft] = useStateP('');

  const p = photos[idx];
  if (!p) return null;

  const goPrev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const goNext = () => setIdx(i => (i + 1) % photos.length);

  return (
    <>
      <div className="sheet-backdrop" style={{ background: 'rgba(15,12,8,0.92)' }} onClick={onClose}></div>
      <div style={{
        position:'absolute', inset: 0, zIndex: 60, padding: '50px 16px 30px',
        display:'flex', flexDirection:'column', gap: 12, pointerEvents:'none',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', color:'#fff', pointerEvents:'auto' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{zoneName}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{fmtTime(p.ts)} · {idx + 1} / {photos.length}</div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius:'50%', background:'rgba(255,255,255,0.15)',
            border: 0, color:'#fff', cursor:'pointer',
          }}>✕</button>
        </div>

        {compareIdx === null ? (
          // Single view
          <>
            <div style={{ position:'relative', flex: 1, display:'grid', placeItems:'center', pointerEvents:'auto' }}>
              <img src={p.dataUrl} alt="" style={{ maxWidth:'100%', maxHeight:'100%', borderRadius: 10, boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}/>
              {photos.length > 1 && (
                <>
                  <button onClick={goPrev} style={leftArrowStyle}>‹</button>
                  <button onClick={goNext} style={rightArrowStyle}>›</button>
                </>
              )}
            </div>

            {/* Note */}
            <div style={{ background:'rgba(255,255,255,0.08)', borderRadius: 12, padding:'10px 14px', pointerEvents:'auto', color:'#fff' }}>
              {editingNote ? (
                <>
                  <input autoFocus value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                         placeholder="替這張照片寫個註記⋯"
                         onKeyDown={(e) => { if (e.key === 'Enter') { onUpdate(p.id, { note: noteDraft }); setEditingNote(false); } }}
                         style={{ width:'100%', background:'transparent', border:'0.5px solid rgba(255,255,255,0.3)',
                           padding:'8px 10px', borderRadius: 8, color:'#fff', fontSize: 13, outline:'none', boxSizing:'border-box' }}/>
                  <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => setEditingNote(false)}
                            style={{ padding:'4px 10px', fontSize: 11, background:'rgba(255,255,255,0.1)', border: 0, borderRadius: 6, color:'#fff', cursor:'pointer' }}>取消</button>
                    <button onClick={() => { onUpdate(p.id, { note: noteDraft }); setEditingNote(false); }}
                            style={{ padding:'4px 10px', fontSize: 11, background:'var(--accent-deep)', border: 0, borderRadius: 6, color:'#fff', cursor:'pointer' }}>儲存</button>
                  </div>
                </>
              ) : (
                <div onClick={() => { setNoteDraft(p.note || ''); setEditingNote(true); }}
                     style={{ fontSize: 13, fontStyle: p.note ? 'italic' : 'normal', opacity: p.note ? 1 : 0.6, cursor:'pointer' }}>
                  {p.note ? `『 ${p.note} 』` : '+ 加入註記'}
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div style={{ display:'flex', gap: 8, pointerEvents:'auto' }}>
              {photos.length > 1 && (
                <button onClick={() => setCompareIdx(idx === 0 ? 1 : 0)}
                        style={{ flex: 1, padding:'10px 14px', borderRadius: 999,
                          background:'rgba(255,255,255,0.1)', color:'#fff', border:'0.5px solid rgba(255,255,255,0.2)',
                          fontSize: 13, cursor:'pointer' }}>
                  ⇔ 與其他照片比較
                </button>
              )}
              <button onClick={() => { if (confirm('刪除這張照片？')) { onDelete(p.id); onClose(); } }}
                      style={{ padding:'10px 14px', borderRadius: 999,
                        background:'rgba(184,116,107,0.2)', color:'#E8A99B', border:'0.5px solid rgba(184,116,107,0.4)',
                        fontSize: 13, cursor:'pointer' }}>刪除</button>
            </div>
          </>
        ) : (
          // Compare view — side by side
          <>
            <div style={{ flex: 1, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, pointerEvents:'auto' }}>
              <CompareSide photos={photos} value={compareIdx} onChange={setCompareIdx} other={idx}/>
              <CompareSide photos={photos} value={idx} onChange={setIdx} other={compareIdx} right/>
            </div>
            <button onClick={() => setCompareIdx(null)}
                    style={{ padding:'10px 14px', borderRadius: 999,
                      background:'rgba(255,255,255,0.1)', color:'#fff', border:'0.5px solid rgba(255,255,255,0.2)',
                      fontSize: 13, cursor:'pointer', pointerEvents:'auto' }}>
              返回單張瀏覽
            </button>
          </>
        )}
      </div>
    </>
  );
}

function CompareSide({ photos, value, onChange, other, right }) {
  const p = photos[value];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
      <div style={{ fontSize: 11, color:'#fff', opacity: 0.7, textAlign: right ? 'right' : 'left' }}>
        {right ? 'AFTER' : 'BEFORE'} · {fmtDate(p.ts)}
      </div>
      <div style={{ flex: 1, display:'grid', placeItems:'center' }}>
        <img src={p.dataUrl} alt="" style={{ maxWidth:'100%', maxHeight:'100%', borderRadius: 8 }}/>
      </div>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}
              style={{ padding:'6px 10px', fontSize: 11, background:'rgba(255,255,255,0.1)', color:'#fff', border:'0.5px solid rgba(255,255,255,0.2)', borderRadius: 6 }}>
        {photos.map((ph, i) => (
          <option key={ph.id} value={i} disabled={i === other} style={{ background:'#2A241C' }}>
            {fmtTime(ph.ts)}
          </option>
        ))}
      </select>
    </div>
  );
}

const leftArrowStyle = {
  position:'absolute', left: 8, top:'50%', transform:'translateY(-50%)',
  width: 38, height: 38, borderRadius:'50%', background:'rgba(0,0,0,0.5)',
  color:'#fff', border:'0.5px solid rgba(255,255,255,0.2)',
  fontSize: 24, cursor:'pointer', lineHeight: 1,
};
const rightArrowStyle = { ...leftArrowStyle, left: 'auto', right: 8 };

Object.assign(window, { resizeImage, AddPhotoButton, PhotoStrip, PhotoLightbox, fmtDate, fmtTime });
