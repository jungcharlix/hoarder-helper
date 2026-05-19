// 囤積症幫手 — 販售統計 視覺化

const { useMemo: useMemoSS } = React;

function SellStatsPanel({ rooms, customGiveaways }) {
  const entries = useMemoSS(() => collectSellEntries(rooms, customGiveaways), [rooms, customGiveaways]);

  // Stats
  const total = entries.reduce((s, e) => s + e.price, 0);
  const sold = entries.filter(e => e.status === '已售出');
  const soldTotal = sold.reduce((s, e) => s + e.price, 0);
  const pending = entries.length - sold.length;

  // By category
  const byCategory = {};
  for (const e of entries) {
    const c = e.category.id;
    if (!byCategory[c]) byCategory[c] = { cat: e.category, total: 0, count: 0, sold: 0, soldCount: 0 };
    byCategory[c].total += e.price;
    byCategory[c].count++;
    if (e.status === '已售出') {
      byCategory[c].sold += e.price;
      byCategory[c].soldCount++;
    }
  }
  const catList = Object.values(byCategory).sort((a, b) => b.total - a.total);
  const maxCatTotal = Math.max(1, ...catList.map(c => c.total));

  // By date — last 30 days
  const now = new Date(); now.setHours(0,0,0,0);
  const days = 30;
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    buckets.push({ date: d, label: `${d.getMonth()+1}/${d.getDate()}`, total: 0, soldTotal: 0, count: 0 });
  }
  for (const e of entries) {
    if (!e.date) continue;
    const dayMs = e.date.getTime();
    for (const b of buckets) {
      if (b.date.getTime() === new Date(dayMs).setHours(0,0,0,0)) {
        b.total += e.price;
        if (e.status === '已售出') b.soldTotal += e.price;
        b.count++;
        break;
      }
    }
  }
  const maxDay = Math.max(1, ...buckets.map(b => b.total));

  if (entries.length === 0) {
    return (
      <div className="card-soft" style={{ textAlign:'center', padding:'30px 14px' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏷️</div>
        <div className="t-body" style={{ textWrap:'pretty' }}>
          還沒有要販售的物品。<br/>
          標為「販售」的物品會在這裡呈現金額統計。
        </div>
      </div>
    );
  }

  return (
    <div className="stack-4">
      {/* Top stats */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
          <span className="h-section">累計金額</span>
          <span className="t-tiny">{entries.length} 件販售物</span>
        </div>
        <div className="h-display" style={{ fontSize: 36, fontFamily:'var(--font-display)' }}>
          NT$ {total.toLocaleString()}
        </div>
        <div className="row" style={{ marginTop: 12, gap: 16 }}>
          <div>
            <div className="t-tiny">已售出</div>
            <div style={{ fontSize: 16, fontWeight: 500, color:'var(--c-give)' }}>
              NT$ {soldTotal.toLocaleString()}<span style={{ fontSize: 11, color:'var(--muted)', marginLeft: 6 }}>· {sold.length} 件</span>
            </div>
          </div>
          <div style={{ width: 0.5, alignSelf:'stretch', background:'var(--border)' }}></div>
          <div>
            <div className="t-tiny">待售</div>
            <div style={{ fontSize: 16, fontWeight: 500, color:'var(--accent-deep)' }}>
              NT$ {(total - soldTotal).toLocaleString()}<span style={{ fontSize: 11, color:'var(--muted)', marginLeft: 6 }}>· {pending} 件</span>
            </div>
          </div>
        </div>
      </div>

      {/* By Category — donut + bars */}
      <div className="card">
        <div className="h-section" style={{ marginBottom: 12 }}>類別 · By Category</div>
        <div className="row" style={{ gap: 16, alignItems:'center', marginBottom: 14 }}>
          <CategoryDonut entries={entries} size={108}/>
          <div style={{ flex: 1 }}>
            <div className="t-tiny" style={{ marginBottom: 4 }}>共 {catList.length} 類</div>
            <div className="h-display" style={{ fontSize: 22 }}>NT$ {total.toLocaleString()}</div>
            <div className="t-tiny" style={{ marginTop: 2 }}>{catList[0]?.cat.name || '—'} 佔最多</div>
          </div>
        </div>
        <div className="stack-2">
          {catList.map(c => (
            <div key={c.cat.id}>
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13, color:'var(--text)' }}>
                  <i style={{ display:'inline-block', width: 8, height: 8, borderRadius: 2, background: c.cat.color, marginRight: 6 }}></i>
                  {c.cat.name}
                  <span style={{ color:'var(--muted)', fontSize: 11, marginLeft: 6 }}>{c.count} 件</span>
                </span>
                <span style={{ fontSize: 13, color:'var(--text)', fontVariantNumeric:'tabular-nums' }}>
                  NT$ {c.total.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background:'var(--border)', overflow:'hidden', position:'relative' }}>
                <div style={{ position:'absolute', inset: 0, width: `${(c.total/maxCatTotal*100).toFixed(1)}%`, background: c.cat.color, borderRadius: 3 }}></div>
                {c.sold > 0 && (
                  <div style={{ position:'absolute', inset: 0, width: `${(c.sold/maxCatTotal*100).toFixed(1)}%`,
                    background: `repeating-linear-gradient(45deg, ${c.cat.color}aa 0 4px, transparent 4px 6px)`, borderRadius: 3 }}></div>
                )}
              </div>
              {c.sold > 0 && (
                <div className="t-tiny" style={{ marginTop: 2, fontSize: 10, color:'var(--c-give)' }}>
                  已售 NT$ {c.sold.toLocaleString()} · {c.soldCount} 件
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* By Date — area chart */}
      <div className="card">
        <div className="h-section" style={{ marginBottom: 12 }}>近 30 天 · By Date</div>
        <DateChart buckets={buckets} max={maxDay}/>
        <div className="row" style={{ gap: 10, justifyContent:'center', marginTop: 10 }}>
          <span className="t-tiny" style={{ display:'inline-flex', alignItems:'center', gap: 4 }}>
            <i style={{ width: 10, height: 4, background:'var(--accent)', borderRadius: 2 }}></i>
            上架金額
          </span>
          <span className="t-tiny" style={{ display:'inline-flex', alignItems:'center', gap: 4 }}>
            <i style={{ width: 10, height: 4, background:'var(--c-give)', borderRadius: 2 }}></i>
            已售金額
          </span>
        </div>
      </div>
    </div>
  );
}

// ───── Donut chart ─────
function CategoryDonut({ entries, size = 110 }) {
  const total = entries.reduce((s, e) => s + e.price, 0);
  if (total === 0) {
    return (
      <div style={{ width: size, height: size, borderRadius:'50%', border:'8px solid var(--border)', display:'grid', placeItems:'center' }}>
        <span className="t-tiny" style={{ fontSize: 10 }}>無資料</span>
      </div>
    );
  }
  const byCat = {};
  for (const e of entries) {
    if (!byCat[e.category.id]) byCat[e.category.id] = { cat: e.category, total: 0 };
    byCat[e.category.id].total += e.price;
  }
  const arr = Object.values(byCat).sort((a, b) => b.total - a.total);

  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  const inner = r - 14;
  let angle = -Math.PI / 2;
  const paths = arr.map(c => {
    const frac = c.total / total;
    const a2 = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + Math.cos(angle) * r,  y1 = cy + Math.sin(angle) * r;
    const x2 = cx + Math.cos(a2)    * r,  y2 = cy + Math.sin(a2)    * r;
    const x3 = cx + Math.cos(a2)    * inner, y3 = cy + Math.sin(a2)    * inner;
    const x4 = cx + Math.cos(angle) * inner, y4 = cy + Math.sin(angle) * inner;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
    angle = a2;
    return { d, color: c.cat.color };
  });
  return (
    <svg width={size} height={size}>
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color}/>)}
    </svg>
  );
}

// ───── Date chart — stacked bars ─────
function DateChart({ buckets, max }) {
  const w = 320, h = 100;
  const gap = 1.5;
  const bw = (w - gap * (buckets.length - 1)) / buckets.length;
  return (
    <div style={{ position:'relative' }}>
      <svg viewBox={`0 0 ${w} ${h + 22}`} style={{ width:'100%', height:'auto', display:'block' }}>
        {/* baseline */}
        <line x1="0" y1={h} x2={w} y2={h} stroke="var(--border)" strokeWidth="0.5"/>
        {/* gridline at 50% */}
        <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 3"/>
        {buckets.map((b, i) => {
          const x = i * (bw + gap);
          const totalH = b.total > 0 ? Math.max(2, (b.total / max) * h) : 0;
          const soldH = b.soldTotal > 0 ? Math.max(2, (b.soldTotal / max) * h) : 0;
          return (
            <g key={i}>
              {totalH > 0 && (
                <rect x={x} y={h - totalH} width={bw} height={totalH}
                      fill="var(--accent)" rx="1.5"/>
              )}
              {soldH > 0 && (
                <rect x={x} y={h - soldH} width={bw} height={soldH}
                      fill="var(--c-give)" rx="1.5"/>
              )}
              {(i === 0 || i === buckets.length - 1 || i % 6 === 0) && (
                <text x={x + bw/2} y={h + 14} textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="var(--font-body)">
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

window.SellStatsPanel = SellStatsPanel;
