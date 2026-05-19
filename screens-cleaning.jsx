// 囤積症幫手 — Cleaning flow (zone → item decision)

const { useState: useStateB } = React;

function CleaningScreen({ zoneId, rooms, setRooms, onBack, onComplete }) {
  // Find zone
  let zone = null, room = null;
  for (const r of rooms) {
    const z = r.zones.find(z => z.id === zoneId);
    if (z) { zone = z; room = r; break; }
  }
  if (!zone) { zone = rooms[0].zones[2] || rooms[0].zones[0]; room = rooms[0]; }

  // Source of truth: zone.itemList (lives in rooms tree)
  const items = zone.itemList || [];

  const [showRitual, setShowRitual] = useStateB(false);
  const [pendingDecision, setPendingDecision] = useStateB(null);
  const [showMemory, setShowMemory] = useStateB(false);
  const [animLeaving, setAnimLeaving] = useStateB(false);
  const [manageOpen, setManageOpen] = useStateB(false);
  const [addOpen, setAddOpen] = useStateB(false);
  const [editingItem, setEditingItem] = useStateB(null);
  const [doneFlag, setDoneFlag] = useStateB(false);
  const [viewIdx, setViewIdx] = useStateB(0);

  // Clamp viewIdx if items shrank
  const safeIdx = Math.max(0, Math.min(viewIdx, items.length - 1));
  const current = items[safeIdx];

  // Navigate prev / next — wraps around the list, skipping into bounds.
  const goPrev = () => setViewIdx(i => (i - 1 + items.length) % items.length);
  const goNext = () => setViewIdx(i => (i + 1) % items.length);
  // Advance to next undecided (or next index if all decided)
  const advanceToNextUndecided = () => {
    const len = items.length;
    for (let step = 1; step <= len; step++) {
      const nextIdx = (safeIdx + step) % len;
      if (!items[nextIdx].decision) {
        setViewIdx(nextIdx);
        return;
      }
    }
    // All decided
    setViewIdx((safeIdx + 1) % len);
  };

  const decisionMeta = {
    keep:    { cls:'quad-keep',    label:'留下', en:'KEEP',    sub:'我需要',     icon:'❤︎', clr:'var(--c-keep)' },
    discard: { cls:'quad-discard', label:'丟棄', en:'DISCARD', sub:'不再需要',   icon:'✕', clr:'var(--c-discard)' },
    give:    { cls:'quad-give',    label:'送出', en:'GIVE',    sub:'給有需要的人', icon:'♡', clr:'var(--c-give)' },
    pending: { cls:'quad-pending', label:'待定', en:'PENDING', sub:'晚點再想',    icon:'…', clr:'var(--c-pending)' },
  };

  const mutateZone = (fn) => {
    const next = JSON.parse(JSON.stringify(rooms));
    for (const r of next) {
      const z = r.zones.find(z => z.id === zoneId);
      if (z) { fn(z); break; }
    }
    setRooms(next);
  };

  const handleDecide = (kind) => {
    if (!current) return;
    if (kind === 'discard' || kind === 'give') {
      setPendingDecision(kind);
      setShowRitual(true);
    } else {
      commitDecision(kind);
    }
  };

  const commitDecision = (kind) => {
    if (!current) return;
    setAnimLeaving(true);
    setTimeout(() => {
      mutateZone(z => {
        const it = z.itemList.find(i => i.id === current.id);
        if (it) it.decision = kind;
        z.decided = z.itemList.filter(i => i.decision).length;
      });
      setAnimLeaving(false);
      setShowRitual(false);
      setPendingDecision(null);
      setShowMemory(false);
      advanceToNextUndecided();
    }, 280);
  };

  const addItem = (newItem) => {
    mutateZone(z => {
      z.itemList = z.itemList || [];
      z.itemList.push({ id: `it-${Date.now()}`, ...newItem });
      // bump estimated total if catalog passes it
      if (z.itemList.length > (z.items || 0)) z.items = z.itemList.length;
    });
    setAddOpen(false);
  };

  const updateItem = (id, patch) => {
    mutateZone(z => {
      const it = z.itemList.find(i => i.id === id);
      if (it) Object.assign(it, patch);
    });
    setEditingItem(null);
  };

  const deleteItem = (id) => {
    mutateZone(z => {
      z.itemList = (z.itemList || []).filter(i => i.id !== id);
      z.decided = z.itemList.filter(i => i.decision).length;
    });
  };

  const decided = items.filter(i => i.decision).length;
  const total = items.length;
  const remaining = total - decided;
  const counts = {
    keep: items.filter(i => i.decision === 'keep').length,
    discard: items.filter(i => i.decision === 'discard').length,
    give: items.filter(i => i.decision === 'give').length,
    pending: items.filter(i => i.decision === 'pending').length,
  };

  // Empty state — no items in this zone yet
  if (items.length === 0) {
    return (
      <div className="fade-in">
        <AppBar title={zone.name} en={room.name}
                left={<button className="icon-btn" onClick={onBack}><Icon.back /></button>} />
        <div style={{ padding: '40px 22px', textAlign: 'center' }}>
          <div style={{ marginTop: 20, marginBottom: 18 }}><Mascot size={68} /></div>
          <div className="h-display" style={{ fontSize: 24, marginBottom: 6 }}>還沒有物品</div>
          <div className="t-body" style={{ marginBottom: 24, textWrap: 'pretty' }}>
            從這一區開始，把要決定的東西一件一件加進來。<br/>
            不急，一次一件就好。
          </div>
          <button className="btn btn-block" onClick={() => setAddOpen(true)}>
            <Icon.plus style={{ width: 16, height: 16 }}/> 新增第一件物品
          </button>
          {addOpen && <AddItemSheet onAdd={addItem} onClose={() => setAddOpen(false)} />}
        </div>
      </div>
    );
  }

  // All decided — show finish-zone screen (user can still navigate back)
  const allDecided = items.every(i => i.decision);
  if (allDecided && doneFlag) {
    return <ZoneDoneScreen
      room={room} zone={zone}
      decisions={items.reduce((m, i) => i.decision ? { ...m, [i.id]: i.decision } : m, {})}
      onBack={onBack} onComplete={onComplete}
      onAddMore={() => { setDoneFlag(false); setAddOpen(true); }}
      onReview={() => setDoneFlag(false)}
      addOpen={addOpen}
      onCloseAdd={() => setAddOpen(false)}
      addItem={addItem}/>;
  }

  return (
    <div className="fade-in">
      <AppBar
        title={zone.name}
        en={`${room.name} · ${safeIdx + 1} / ${items.length}`}
        left={<button className="icon-btn" onClick={onBack}><Icon.back /></button>}
        right={
          <button className="icon-btn" onClick={() => setManageOpen(true)} title="管理物品">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13M8 12h13M8 18h13"/>
              <circle cx="4" cy="6" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="4" cy="18" r="1.5"/>
            </svg>
          </button>
        }
      />

      {/* Progress strip */}
      <div className="section-tight">
        <div className="progress-track" style={{ height: 4 }}>
          <div className="progress-fill" style={{ width: `${(decided/total)*100}%` }}></div>
        </div>
        <div className="row-between" style={{ marginTop: 6 }}>
          <span className="t-tiny">已決定 {decided} / {total}</span>
          <span className="t-tiny">{allDecided ? '本區可以完成囉 ✓' : `還剩 ${remaining} 件`}</span>
        </div>
        {allDecided && (
          <button className="btn btn-block" style={{ marginTop: 10, background: 'var(--c-give)' }} onClick={() => setDoneFlag(true)}>
            <Icon.check style={{ width: 16, height: 16 }}/> 完成這一區
          </button>
        )}
      </div>

      {/* Item card */}
      {current && (
        <div className="section" style={{ paddingTop: 8, position: 'relative' }}>
          {items.length > 1 && (
            <button onClick={goPrev} title="上一件"
              style={{ position: 'absolute', left: 6, top: '38%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--card)', border: '0.5px solid var(--border-strong)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                color: 'var(--text-soft)', zIndex: 5, boxShadow: 'var(--shadow-sm)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
          )}
          {items.length > 1 && (
            <button onClick={goNext} title="下一件"
              style={{ position: 'absolute', right: 6, top: '38%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--card)', border: '0.5px solid var(--border-strong)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
                color: 'var(--text-soft)', zIndex: 5, boxShadow: 'var(--shadow-sm)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          )}
          <div className={`card ${animLeaving ? 'lift' : 'slide-up'}`} key={current.id} style={{ padding: 22, textAlign:'center', position:'relative' }}>
            {current.decision && (
              <div style={{ marginBottom: 10 }}>
                <span className={`chip chip-${current.decision}`} style={{ padding:'4px 12px' }}>
                  ✓ 已決定 · {current.decision === 'keep' ? '留下' : current.decision === 'discard' ? '丟棄' : current.decision === 'give' ? '送出' : '待定'}
                </span>
              </div>
            )}
            {/* edit/delete icon */}
            <button className="icon-btn" style={{ position:'absolute', top: 12, right: 12, width: 30, height: 30 }} onClick={() => setEditingItem(current)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L8 22H2v-6L14 4z"/></svg>
            </button>

            <div style={{
              width: '100%', aspectRatio:'1.4 / 1',
              borderRadius:'var(--radius-md)',
              background:'repeating-linear-gradient(135deg, var(--card-soft) 0 16px, var(--bg-soft) 16px 32px)',
              border:'0.5px solid var(--border)',
              display:'grid', placeItems:'center',
              position:'relative', marginBottom: 16,
            }}>
              <div style={{ fontSize: 56, lineHeight: 1 }}>{current.emoji || '📦'}</div>
              <div style={{ position:'absolute', bottom: 8, left: 0, right: 0, textAlign:'center' }}>
                <span style={{ fontFamily:'ui-monospace, monospace', fontSize: 10, color:'var(--muted)', letterSpacing:'0.06em', background:'var(--card)', padding:'2px 8px', borderRadius: 4 }}>
                  ITEM PHOTO
                </span>
              </div>
            </div>

            {current.enName && <div className="t-tiny" style={{ marginBottom: 4 }}>{current.enName}</div>}
            <div className="h-title" style={{ fontSize: 20, marginBottom: 6 }}>{current.name}</div>
            {current.desc && <div className="t-small" style={{ textWrap:'pretty' }}>{current.desc}</div>}

            {current.hint && (
              <div className="card-soft" style={{ marginTop: 14, textAlign:'left', display:'flex', gap: 10, alignItems:'flex-start' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}><Icon.leaf style={{ width:16, height:16, color:'var(--accent-deep)' }}/></div>
                <div className="t-small" style={{ fontSize: 13 }}>{current.hint}</div>
              </div>
            )}

            {current.memory && (
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-ghost" style={{ fontSize: 13, padding:'6px 10px' }} onClick={() => setShowMemory(s => !s)}>
                  {showMemory ? '收起回憶 ⌃' : '寫下回憶 ＋'}
                </button>
                {showMemory && (
                  <div className="fade-in" style={{ marginTop: 8, padding:'12px 14px', background:'var(--accent-soft)', borderRadius:'var(--radius-md)', textAlign:'left' }}>
                    <div className="t-tiny" style={{ marginBottom: 4 }}>我記得 · I remember</div>
                    <div className="t-body" style={{ fontFamily:'var(--font-display)', fontStyle:'italic', fontSize: 14 }}>
                      『 {current.memory} 』
                    </div>
                    <div className="t-tiny" style={{ marginTop: 6 }}>
                      回憶會留下，物品可以放下。
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Pagination indicator */}
          <div className="row" style={{ justifyContent:'center', gap: 14, marginTop: 12 }}>
            <span className="t-tiny" style={{ fontVariantNumeric:'tabular-nums' }}>
              {safeIdx + 1} / {items.length}
            </span>
            <span className="t-tiny" style={{ opacity: 0.5 }}>·</span>
            <span className="t-tiny">
              {current.decision ? '可重新決定' : '未決定'}
            </span>
          </div>
        </div>
      )}

      {/* Quadrant */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="quad-grid">
          {['keep','discard','give','pending'].map(k => {
            const m = decisionMeta[k];
            return (
              <button key={k} className={`quad-btn ${m.cls}`} onClick={() => handleDecide(k)}>
                <div className="icon" style={{ color: m.clr }}><span style={{ fontSize: 20, fontWeight: 500 }}>{m.icon}</span></div>
                <div className="label">{m.label}</div>
                <div className="sub">{m.sub}</div>
              </button>
            );
          })}
        </div>

        <div className="row-between" style={{ marginTop: 4, padding:'0 4px' }}>
          <span className="chip chip-keep">留 {counts.keep}</span>
          <span className="chip chip-discard">丟 {counts.discard}</span>
          <span className="chip chip-give">送 {counts.give}</span>
          <span className="chip chip-pending">待 {counts.pending}</span>
        </div>

        {/* Add more item */}
        <button className="btn btn-ghost btn-block" style={{ marginTop: 14, fontSize: 13 }} onClick={() => setAddOpen(true)}>
          <Icon.plus style={{ width: 14, height: 14 }}/> 新增此區的物品
        </button>
      </div>

      {/* Release ritual sheet */}
      {showRitual && pendingDecision && current && (
        <ReleaseRitual
          item={current}
          kind={pendingDecision}
          onCancel={() => { setShowRitual(false); setPendingDecision(null); }}
          onConfirm={() => commitDecision(pendingDecision)}
        />
      )}

      {manageOpen && (
        <ManageItemsSheet
          items={items}
          onClose={() => setManageOpen(false)}
          onDelete={deleteItem}
          onEdit={(it) => { setManageOpen(false); setEditingItem(it); }}
          onAdd={() => { setManageOpen(false); setAddOpen(true); }}
        />
      )}

      {addOpen && <AddItemSheet onAdd={addItem} onClose={() => setAddOpen(false)} />}
      {editingItem && <AddItemSheet initial={editingItem} onAdd={(patch) => updateItem(editingItem.id, patch)} onClose={() => setEditingItem(null)} editing/>}
    </div>
  );
}

// ───────── Add / Edit item sheet ─────────
function AddItemSheet({ initial, onAdd, onClose, editing = false }) {
  const [emoji, setEmoji] = useStateB(initial?.emoji || '📦');
  const [name, setName] = useStateB(initial?.name || '');
  const [desc, setDesc] = useStateB(initial?.desc || '');
  const [hint, setHint] = useStateB(initial?.hint || '');
  const [memory, setMemory] = useStateB(initial?.memory || '');

  const emojiSet = ['📦','📰','📚','📝','👕','👜','🧸','🎁','🕯️','🍶','🪞','🖼️','🔌','💿','🧴','🧦','🔑','✏️','📱','🪴','💌','📷','⌚','💄'];

  return (
    <Sheet open={true} onClose={onClose}>
      <div style={{ padding: '4px 4px 4px' }}>
        <div className="h-title" style={{ fontSize: 19, marginBottom: 4 }}>{editing ? '編輯物品' : '新增物品'}</div>
        <div className="t-small" style={{ marginBottom: 16 }}>
          {editing ? '更新這件物品的資訊。' : '描述一下這件東西。可以很簡短。'}
        </div>

        <div className="t-tiny" style={{ marginBottom: 6 }}>圖示</div>
        <div style={{ display:'flex', gap: 4, flexWrap:'wrap', marginBottom: 16, maxHeight: 88, overflowY:'auto' }}>
          {emojiSet.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
                    style={{
                      width: 36, height: 36, fontSize: 22, lineHeight: 1,
                      borderRadius: 8, cursor:'pointer',
                      border: emoji === e ? '1.5px solid var(--accent-deep)' : '0.5px solid var(--border)',
                      background: emoji === e ? 'var(--accent-soft)' : 'var(--card-soft)',
                    }}>{e}</button>
          ))}
        </div>

        <div className="t-tiny" style={{ marginBottom: 6 }}>名稱 *</div>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
               placeholder="例如：舊外套、過期化妝品"
               style={inputStyle}/>

        <div className="t-tiny" style={{ marginBottom: 6, marginTop: 12 }}>狀況描述（可選）</div>
        <input value={desc} onChange={(e) => setDesc(e.target.value)}
               placeholder="顏色、損壞情況、購入時間⋯"
               style={inputStyle}/>

        <div className="t-tiny" style={{ marginBottom: 6, marginTop: 12 }}>提示（可選）</div>
        <input value={hint} onChange={(e) => setHint(e.target.value)}
               placeholder="幫助你判斷的線索"
               style={inputStyle}/>

        <div className="t-tiny" style={{ marginBottom: 6, marginTop: 12 }}>回憶（可選）</div>
        <textarea value={memory} onChange={(e) => setMemory(e.target.value)}
               placeholder="關於這件物品的故事"
               rows={2}
               style={{ ...inputStyle, fontFamily:'var(--font-display)', fontStyle: memory ? 'italic' : 'normal' }}/>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
          <button className="btn" style={{ flex: 2 }} disabled={!name.trim()}
                  onClick={() => name.trim() && onAdd({ emoji, name: name.trim(), desc: desc.trim(), hint: hint.trim(), memory: memory.trim() })}>
            {editing ? '儲存' : '加入清單'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '0.5px solid var(--border-strong)', borderRadius: 10,
  background: 'var(--card-soft)', fontSize: 14, color: 'var(--text)',
  outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  resize: 'vertical',
};

// ───────── Manage items sheet ─────────
function ManageItemsSheet({ items, onClose, onDelete, onEdit, onAdd }) {
  return (
    <Sheet open={true} onClose={onClose}>
      <div style={{ padding: '4px 4px 4px' }}>
        <div className="row-between" style={{ marginBottom: 4 }}>
          <div className="h-title" style={{ fontSize: 19 }}>物品清單</div>
          <span className="t-tiny">{items.length} 件</span>
        </div>
        <div className="t-small" style={{ marginBottom: 14 }}>編輯、刪除，或新增更多物品。</div>

        <div className="stack-2" style={{ maxHeight: 380, overflowY: 'auto', marginBottom: 14 }}>
          {items.map(it => (
            <div key={it.id} className="card-soft" style={{ display:'flex', alignItems:'center', gap: 10, padding: 10 }}>
              <div style={{ fontSize: 24, width: 34, textAlign:'center' }}>{it.emoji || '📦'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color:'var(--text)', fontWeight: 500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.name}</div>
                <div style={{ display:'flex', gap: 4, alignItems:'center', marginTop: 2 }}>
                  {it.decision && (
                    <span className={`chip chip-${it.decision}`} style={{ padding:'1px 6px', fontSize: 10 }}>
                      {it.decision === 'keep' ? '留' : it.decision === 'discard' ? '丟' : it.decision === 'give' ? '送' : '待'}
                    </span>
                  )}
                  <span className="t-tiny" style={{ fontSize: 11, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.desc || it.enName || ''}</span>
                </div>
              </div>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => onEdit(it)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6L8 22H2v-6L14 4z"/></svg>
              </button>
              <button className="icon-btn" style={{ width: 30, height: 30, color: 'var(--c-discard)' }} onClick={() => onDelete(it.id)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="t-small" style={{ textAlign:'center', padding:'20px 0' }}>清單還是空的</div>
          )}
        </div>

        <button className="btn btn-block" onClick={onAdd}>
          <Icon.plus style={{ width: 14, height: 14 }}/> 新增物品
        </button>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 6 }} onClick={onClose}>完成</button>
      </div>
    </Sheet>
  );
}

function ReleaseRitual({ item, kind, onCancel, onConfirm }) {
  const isDiscard = kind === 'discard';
  return (
    <Sheet open={true} onClose={onCancel}>
      <div style={{ textAlign:'center', padding:'8px 4px 4px' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{isDiscard ? '🕊️' : '🎁'}</div>
        <div className="h-title" style={{ fontSize: 20, marginBottom: 6 }}>
          {isDiscard ? '謝謝它陪我一段路' : '讓它有新的家'}
        </div>
        <div className="t-small" style={{ marginBottom: 18, textWrap:'pretty', padding:'0 14px' }}>
          {isDiscard
            ? '深呼吸一次。物品曾經服務過你，現在輪到它去別的地方。'
            : '把這份溫暖傳給下一個人。物品的故事還沒結束。'}
        </div>

        <div className="card-soft" style={{ textAlign:'left', display:'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 32 }}>{item.emoji || '📦'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color:'var(--text)', fontWeight: 500 }}>{item.name}</div>
            {item.enName && <div className="t-tiny" style={{ marginTop: 2 }}>{item.enName}</div>}
          </div>
        </div>

        {!isDiscard && (
          <div style={{ marginBottom: 16, textAlign:'left' }}>
            <div className="t-tiny" style={{ marginBottom: 6 }}>誰可能會喜歡？</div>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
              {['朋友', '社區公告', '蝦皮二手', '回收平台', '其他'].map(o => (
                <span key={o} className="chip" style={{ padding:'6px 12px', fontSize: 12 }}>{o}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>再想一下</button>
          <button className="btn" style={{ flex: 2, background: isDiscard ? 'var(--c-discard)' : 'var(--c-give)' }} onClick={onConfirm}>
            {isDiscard ? '輕輕放下' : '送出溫暖'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function ZoneDoneScreen({ room, zone, decisions, onBack, onComplete, onAddMore, onReview, addOpen, onCloseAdd, addItem }) {
  const c = {
    keep: Object.values(decisions).filter(v => v === 'keep').length,
    discard: Object.values(decisions).filter(v => v === 'discard').length,
    give: Object.values(decisions).filter(v => v === 'give').length,
    pending: Object.values(decisions).filter(v => v === 'pending').length,
  };
  const total = c.keep + c.discard + c.give + c.pending;
  return (
    <div className="fade-in" style={{ padding:'40px 22px', textAlign:'center', minHeight: '100%' }}>
      <div style={{ marginTop: 30, marginBottom: 18 }}>
        <Mascot size={84} />
      </div>
      <div className="t-tiny">{room.name} · {zone.name}</div>
      <div className="h-display" style={{ fontSize: 28, margin:'10px 0 6px' }}>這一區，完成了。</div>
      <div className="t-body" style={{ marginBottom: 24, textWrap:'pretty' }}>
        你做了 {total} 個決定。每一個都需要勇氣。
      </div>

      <div className="card" style={{ textAlign:'left', marginBottom: 16 }}>
        <div className="h-section" style={{ marginBottom: 12 }}>本區結果</div>
        <div className="stack-3">
          {[
            { k:'keep', n: c.keep, label:'留下', cls:'chip-keep' },
            { k:'discard', n: c.discard, label:'丟棄', cls:'chip-discard' },
            { k:'give', n: c.give, label:'送出', cls:'chip-give' },
            { k:'pending', n: c.pending, label:'待定', cls:'chip-pending' },
          ].map(r => (
            <div key={r.k} className="row-between">
              <span className={`chip ${r.cls}`}>{r.label}</span>
              <span className="h-title" style={{ fontSize: 17 }}>{r.n} <span className="t-tiny">件</span></span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-secondary btn-block" style={{ marginBottom: 16 }} onClick={onAddMore}>
        <Icon.plus style={{ width: 14, height: 14 }}/> 再加入更多物品
      </button>

      <div className="card-soft" style={{ marginBottom: 24, textAlign:'left' }}>
        <div className="t-tiny" style={{ marginBottom: 4 }}>明天的小區域</div>
        <div className="h-title" style={{ fontSize: 16 }}>{SCHEDULE[1].zone}</div>
        <div className="t-small">{SCHEDULE[1].date} · {SCHEDULE[1].time}</div>
      </div>

      <button className="btn btn-block" onClick={onComplete}>回到首頁</button>
      {onReview && <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={onReview}>回到清理流程 · 重新檢視</button>}
      <button className="btn btn-ghost btn-block" style={{ marginTop: 4 }} onClick={onBack}>查看本房間</button>

      {addOpen && <AddItemSheet onAdd={addItem} onClose={onCloseAdd} />}
    </div>
  );
}

Object.assign(window, { CleaningScreen });
