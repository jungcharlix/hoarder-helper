// 囤積症幫手 — 匯入 / 匯出

const { useState: useStateE, useRef: useRefE } = React;

// Trigger a file download from a string/Blob
function downloadBlob(content, filename, mime = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// HTML report — pretty stats + zone breakdown
function buildStatsReport(user, rooms, giveaways) {
  const totals = rooms.reduce((s, r) => {
    for (const z of r.zones) for (const it of (z.itemList || [])) {
      if (!it.decision) continue;
      s.total++;
      if (it.decision === 'keep') s.keep++;
      else if (it.decision === 'discard') s.discard++;
      else if (it.decision === 'give' || it.decision === 'sell') s.give++;
      else if (it.decision === 'pending') s.pending++;
    }
    return s;
  }, { total: 0, keep: 0, discard: 0, give: 0, pending: 0 });
  const totalZones = rooms.reduce((s, r) => s + r.zones.length, 0);
  const doneZones = rooms.reduce((s, r) => s + r.zones.filter(z => {
    const lst = (z.itemList || []);
    return lst.length > 0 && lst.every(it => it.decision);
  }).length, 0);

  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"/>
<title>${user.name} 的整理報表 · 囤積症幫手</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Noto Serif TC','Noto Sans TC','PingFang TC',serif;
    background:#F5EFE6; color:#3A2E26; margin:0; padding:40px 20px; line-height:1.6;}
  .container{max-width:760px; margin:0 auto; background:#FFFCF7; padding:48px;
    border-radius:24px; box-shadow:0 6px 30px rgba(0,0,0,0.06);}
  h1{font-size:34px; margin:0 0 4px; font-weight:500; letter-spacing:-0.01em;}
  .sub{font-style:italic; color:#8B7355; margin-bottom:32px; font-family:'EB Garamond',serif;}
  .row{display:flex; gap:14px; margin-bottom:28px;}
  .stat{flex:1; background:#FAF3E7; border:0.5px solid #E8DDC8; border-radius:14px; padding:18px; text-align:center;}
  .stat .v{font-size:32px; font-weight:500; color:#3A2E26; line-height:1.1;}
  .stat .l{font-size:12px; color:#8B7355; letter-spacing:0.08em; text-transform:uppercase; margin-top:6px;}
  h2{font-size:22px; margin:36px 0 14px; font-weight:500; border-bottom:0.5px solid #E8DDC8; padding-bottom:8px;}
  .bar{height:24px; border-radius:6px; background:#E8DDC8; overflow:hidden; display:flex;}
  .bar > div{height:100%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:500;}
  .bar > .keep{background:#94A8B8;} .bar > .discard{background:#B8746B;}
  .bar > .give{background:#8FAA8A;} .bar > .pending{background:#BFA98C;}
  .legend{display:flex; gap:18px; margin-top:10px; flex-wrap:wrap; font-size:12px;}
  .legend span{display:inline-flex; align-items:center; gap:6px;}
  .legend i{width:10px; height:10px; border-radius:2px; display:inline-block;}
  .room{margin:14px 0; padding:14px 18px; background:#FAF3E7; border-radius:12px;}
  .room-name{font-weight:500; margin-bottom:6px;}
  .room-bar{height:6px; border-radius:3px; background:#E8DDC8; overflow:hidden;}
  .room-bar > div{height:100%; background:#D4A574;}
  .meta{font-size:11px; color:#8B7355; margin-top:6px; display:flex; justify-content:space-between;}
  footer{margin-top:48px; padding-top:24px; border-top:0.5px solid #E8DDC8; font-size:11px; color:#8B7355; text-align:center;}
  @media print{body{background:#fff;padding:0} .container{box-shadow:none;border-radius:0;}}
</style></head><body>
<div class="container">
  <h1>${user.name} · ${user.emoji} 整理報表</h1>
  <div class="sub">A journey of letting go · 第 ${daysSince(user.joined) + 1} 天 · 匯出於 ${new Date().toLocaleString('zh-TW')}</div>

  <div class="row">
    <div class="stat"><div class="v">${totals.total}</div><div class="l">已決定 Decided</div></div>
    <div class="stat"><div class="v">${doneZones}<small style="font-size:14px;color:#8B7355"> / ${totalZones}</small></div><div class="l">區域完成</div></div>
    <div class="stat"><div class="v">${giveaways.length}</div><div class="l">送養品項</div></div>
  </div>

  <h2>決定分佈 · Distribution</h2>
  ${totals.total > 0 ? `<div class="bar">
    ${totals.keep    ? `<div class="keep"    style="width:${(totals.keep/totals.total*100).toFixed(1)}%">${totals.keep}</div>` : ''}
    ${totals.discard ? `<div class="discard" style="width:${(totals.discard/totals.total*100).toFixed(1)}%">${totals.discard}</div>` : ''}
    ${totals.give    ? `<div class="give"    style="width:${(totals.give/totals.total*100).toFixed(1)}%">${totals.give}</div>` : ''}
    ${totals.pending ? `<div class="pending" style="width:${(totals.pending/totals.total*100).toFixed(1)}%">${totals.pending}</div>` : ''}
  </div>` : '<p style="color:#8B7355">尚無資料</p>'}
  <div class="legend">
    <span><i style="background:#94A8B8"></i>留下 ${totals.keep}</span>
    <span><i style="background:#B8746B"></i>丟棄 ${totals.discard}</span>
    <span><i style="background:#8FAA8A"></i>送出 ${totals.give}</span>
    <span><i style="background:#BFA98C"></i>待定 ${totals.pending}</span>
  </div>

  <h2>各空間進度 · By Room</h2>
  ${rooms.map(r => {
    const items = r.zones.reduce((s, z) => s + (z.itemList?.length || 0), 0);
    const decided = r.zones.reduce((s, z) => s + (z.itemList || []).filter(i => i.decision).length, 0);
    const pct = items ? (decided / items * 100).toFixed(1) : 0;
    return `<div class="room">
      <div class="room-name">${r.name} <span style="font-weight:300; color:#8B7355; font-style:italic; font-size:13px;">${r.enName || ''}</span></div>
      <div class="room-bar"><div style="width:${pct}%"></div></div>
      <div class="meta"><span>${decided} / ${items} 件</span><span>${pct}%</span></div>
    </div>`;
  }).join('')}

  <h2>送養紀錄 · Find new homes</h2>
  ${giveaways.length === 0 ? '<p style="color:#8B7355">尚無送養紀錄</p>' :
    `<table style="width:100%; border-collapse:collapse;">
      ${giveaways.map(g => `<tr style="border-bottom:0.5px solid #E8DDC8">
        <td style="padding:10px 6px;">${g.emoji || '🎁'} ${g.name}</td>
        <td style="padding:10px 6px; color:#8B7355; font-size:12px;">${g.type === '送' ? (g.recipient || '') : (g.price || '')}</td>
        <td style="padding:10px 6px; text-align:right; font-size:12px;">${g.status || ''}</td>
      </tr>`).join('')}
    </table>`}

  <footer>囤積症幫手 · A Gentle Tidying Companion</footer>
</div></body></html>`;
}

// HTML memorial — every item that has a decision, with its memory + hint
// `layout` can be: 'gallery' (default), 'polaroid' (grid), 'journal' (one per page)
function buildMemorialReport(user, rooms, layout = 'gallery') {
  const allItems = [];
  for (const r of rooms) for (const z of r.zones) for (const it of (z.itemList || [])) {
    if (it.decision) allItems.push({ ...it, _room: r.name, _zone: z.name });
  }
  const grouped = {};
  for (const it of allItems) {
    const k = `${it._room}·${it._zone}`;
    (grouped[k] = grouped[k] || []).push(it);
  }
  const decisionLabel = {
    keep: '留下', discard: '丟棄', give: '送出', sell: '販售', pending: '待定',
  };
  const decisionColor = {
    keep: '#94A8B8', discard: '#B8746B', give: '#8FAA8A', sell: '#D4A574', pending: '#BFA98C',
  };

  // ─── Layout: Polaroid grid ───
  if (layout === 'polaroid') {
    return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"/>
<title>${user.name} 的物品紀念冊 · 照片牆</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Noto Serif TC','PingFang TC',serif; background:#2A241C; color:#F4E4C9;
    margin:0; padding:40px 20px;}
  .container{max-width:900px; margin:0 auto;}
  h1{font-family:'EB Garamond','Noto Serif TC',serif; font-size:42px; text-align:center; margin:0 0 8px; font-weight:500;}
  .sub{text-align:center; font-style:italic; color:#C9AE82; margin-bottom:48px; font-family:'EB Garamond',serif;}
  h2{font-family:'Noto Serif TC',serif; font-size:18px; margin:48px 0 18px; padding-left:14px;
    border-left:3px solid #D4A574; color:#F4E4C9; font-weight:500;}
  .grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:24px;}
  .polaroid{background:#FFFCF7; padding:14px 14px 22px; border-radius:4px;
    box-shadow:0 6px 16px rgba(0,0,0,0.35); color:#3A2E26;
    transform:rotate(var(--rot, 0deg)); transition:transform .2s; position:relative;}
  .polaroid:nth-child(3n) { --rot: -1.5deg; }
  .polaroid:nth-child(3n+1) { --rot: 0.8deg; }
  .polaroid:nth-child(3n+2) { --rot: -0.4deg; }
  .polaroid:hover{transform:rotate(0deg) scale(1.02); z-index:1;}
  .photo{aspect-ratio:1; background:linear-gradient(135deg, #F5EFE6, #ECD9B7);
    border-radius:2px; display:grid; place-items:center; margin-bottom:14px;
    box-shadow:inset 0 2px 6px rgba(0,0,0,0.06);}
  .photo .e{font-size:96px; line-height:1; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));}
  .name{font-size:15px; font-weight:500; margin:0 0 4px; font-family:'Noto Serif TC',serif;}
  .desc{font-size:12px; color:#8B7355; margin-bottom:6px;}
  .memory{font-style:italic; font-size:12px; color:#5C4A3D; padding:8px 10px;
    background:#FAF3E7; border-radius:4px; margin-top:8px;}
  .chip{display:inline-block; padding:2px 8px; border-radius:999px;
    font-size:10px; color:#fff; margin-top:6px;}
  .meta{font-size:10px; color:#A89479; margin-top:6px;}
  footer{margin-top:60px; text-align:center; font-size:11px; color:#A89479; font-style:italic;}
  @media print{body{background:#fff; color:#3A2E26;} h1, h2, footer{color:#3A2E26;}}
</style></head><body>
<div class="container">
  <h1>${user.name} 的物品紀念冊</h1>
  <div class="sub">${user.emoji} A Photo Wall of Things I Have Met · ${new Date().toLocaleDateString('zh-TW')}</div>

  ${Object.entries(grouped).map(([groupName, items]) => `
    <h2>${groupName}</h2>
    <div class="grid">
      ${items.map(it => `
        <div class="polaroid">
          <div class="photo"><span class="e">${it.emoji || '📦'}</span></div>
          <div class="name">${it.name}</div>
          ${it.desc ? `<div class="desc">${it.desc}</div>` : ''}
          ${it.memory ? `<div class="memory">『 ${it.memory} 』</div>` : ''}
          <span class="chip" style="background:${decisionColor[it.decision]}">${decisionLabel[it.decision] || it.decision}</span>
          <div class="meta">${it._zone}</div>
        </div>
      `).join('')}
    </div>
  `).join('')}

  ${allItems.length === 0 ? '<p style="text-align:center; padding:80px 0;">紀念冊還是空的。</p>' : ''}

  <footer>囤積症幫手 · ${allItems.length} 件物品的故事</footer>
</div></body></html>`;
  }

  // ─── Layout: Journal (one per page) ───
  if (layout === 'journal') {
    return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"/>
<title>${user.name} 的物品日記</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Noto Serif TC','PingFang TC',serif; background:#F5EFE6; color:#3A2E26;
    margin:0; padding:0; line-height:1.8;}
  .page{max-width:600px; margin:40px auto; background:#FFFCF7;
    padding:80px 70px; box-shadow:0 6px 30px rgba(0,0,0,0.06);
    border-radius:4px; min-height:90vh; display:flex; flex-direction:column;
    border-top:6px solid #D4A574;}
  .cover{text-align:center; padding-top:120px;}
  .cover h1{font-family:'EB Garamond',serif; font-size:56px; font-weight:400; margin:0 0 12px; letter-spacing:-0.01em;}
  .cover .sub{font-style:italic; color:#8B7355; font-size:18px; margin-bottom:40px;}
  .cover .preface{padding:24px 28px; background:#FAF3E7; border-radius:8px;
    text-align:left; font-size:14px; color:#5C4A3D; text-wrap:pretty;}
  .item-date{font-family:'EB Garamond',serif; font-style:italic; color:#8B7355;
    font-size:14px; margin-bottom:8px; border-bottom:0.5px dashed #D9C29B; padding-bottom:14px;}
  .photo{aspect-ratio:1.2/1; background:linear-gradient(135deg, #F5EFE6, #ECD9B7);
    border-radius:6px; display:grid; place-items:center; margin:0 -16px 28px;
    box-shadow:inset 0 4px 12px rgba(0,0,0,0.04);}
  .photo .e{font-size:160px; line-height:1; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.1));}
  .item-name{font-size:32px; font-weight:500; margin:0 0 12px; line-height:1.2; letter-spacing:-0.01em;}
  .desc{font-size:16px; color:#5C4A3D; margin-bottom:24px;}
  .memory{font-style:italic; font-size:18px; color:#3A2E26; padding:20px 24px;
    background:#FAF3E7; border-left:4px solid #D4A574; border-radius:6px; margin:20px 0;
    line-height:1.7;}
  .hint{font-size:13px; color:#8B7355; padding-top:14px; border-top:0.5px solid #E8DDC8; margin-top:auto;}
  .chip{display:inline-block; padding:4px 12px; border-radius:999px;
    font-size:12px; color:#fff;}
  .footer-page{text-align:center; padding:80px 40px; color:#8B7355; font-style:italic;}
  .page-num{text-align:right; font-family:'EB Garamond',serif; font-style:italic; color:#A89479;
    font-size:12px; padding-top:20px;}
  @media print{
    body{background:#fff;}
    .page{box-shadow:none; margin:0; max-width:none; min-height:auto;
      page-break-after:always; break-after:page; padding:60px;}
  }
</style></head><body>

<div class="page cover">
  <h1>物品紀念冊</h1>
  <div class="sub">${user.name} ${user.emoji}</div>
  <div class="sub" style="font-size:14px; margin-bottom:60px;">${new Date().toLocaleDateString('zh-TW')}</div>
  <div class="preface">
    這本日記收錄了 <b>${allItems.length}</b> 件你親自做過決定的物品。<br/>
    每一頁都是一件物品的故事。願記憶留下，物品自由前行。
  </div>
</div>

${allItems.map((it, i) => `
  <div class="page">
    <div class="item-date">${it._room} · ${it._zone} · 第 ${i + 1} 件</div>
    <div class="photo"><span class="e">${it.emoji || '📦'}</span></div>
    <div class="item-name">${it.name}</div>
    ${it.desc ? `<div class="desc">${it.desc}</div>` : ''}
    ${it.memory ? `<div class="memory">『 ${it.memory} 』</div>` : ''}
    <div class="hint">
      <span class="chip" style="background:${decisionColor[it.decision]}">${decisionLabel[it.decision] || it.decision}</span>
      ${it.hint ? `<span style="margin-left:10px;">${it.hint}</span>` : ''}
    </div>
    <div class="page-num">${i + 1} / ${allItems.length}</div>
  </div>
`).join('')}

${allItems.length === 0 ? '<div class="page footer-page">紀念冊還是空的。<br/>等你做出第一個決定，故事就開始了。</div>' :
  '<div class="page footer-page">— 完 —<br/><br/>你所放下的，不是回憶，<br/>是它們去新世界的允許。</div>'}

</body></html>`;
  }

  // ─── Layout: Gallery (default — large hero items in card style) ───
  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"/>
<title>${user.name} 的物品紀念冊</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Noto Serif TC','PingFang TC',serif; background:#F5EFE6; color:#3A2E26;
    margin:0; padding:40px 20px; line-height:1.7;}
  .container{max-width:760px; margin:0 auto; background:#FFFCF7; padding:60px 48px;
    border-radius:24px; box-shadow:0 6px 30px rgba(0,0,0,0.06);}
  h1{font-family:'EB Garamond','Noto Serif TC',serif; font-size:44px; font-weight:500; margin:0 0 4px; letter-spacing:-0.01em;}
  .sub{font-style:italic; color:#8B7355; font-family:'EB Garamond',serif; margin-bottom:42px; font-size:16px;}
  .preamble{padding:20px 24px; background:#FAF3E7; border-radius:14px;
    margin-bottom:36px; font-size:14px; color:#5C4A3D; text-wrap:pretty;}
  h2{font-size:22px; font-weight:500; margin:48px 0 20px;
    padding-bottom:10px; border-bottom:0.5px solid #E8DDC8; letter-spacing:0.02em;}
  .item{padding:28px; margin-bottom:20px; background:#FAF3E7; border-radius:18px;}
  .photo{aspect-ratio:1.4/1; background:#FFFCF7;
    border-radius:12px; display:grid; place-items:center; margin-bottom:22px;
    box-shadow:inset 0 2px 8px rgba(0,0,0,0.04);
    border:0.5px solid #E8DDC8;}
  .photo .e{font-size:120px; line-height:1; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.08));}
  .item h3{font-size:24px; font-weight:500; margin:0 0 8px; line-height:1.25;}
  .desc{font-size:15px; color:#5C4A3D; margin-bottom:14px;}
  .memory{font-style:italic; font-size:16px; color:#3A2E26;
    padding:14px 18px; background:#fff; border-left:3px solid #D4A574;
    border-radius:6px; margin-top:12px; line-height:1.7;}
  .row{display:flex; align-items:center; gap:10px; margin-top:14px;}
  .chip{display:inline-block; padding:4px 12px; border-radius:999px;
    font-size:12px; color:#fff;}
  .meta{font-size:12px; color:#8B7355;}
  footer{margin-top:60px; padding-top:24px; border-top:0.5px solid #E8DDC8;
    font-size:11px; color:#8B7355; text-align:center; font-style:italic;}
  @media print{body{background:#fff;padding:0} .container{box-shadow:none;border-radius:0;}}
</style></head><body>
<div class="container">
  <h1>物品紀念冊</h1>
  <div class="sub">${user.name} ${user.emoji} · A Book of Things I Have Met · ${new Date().toLocaleDateString('zh-TW')}</div>

  <div class="preamble">
    這本紀念冊收錄了 <b>${allItems.length}</b> 件你親自做過決定的物品。<br/>
    每一件都曾在你的生活中扮演過某個角色。願記憶安住於此，物品則自由前往新的去處。
  </div>

  ${Object.entries(grouped).map(([groupName, items]) => `
    <h2>${groupName}</h2>
    ${items.map(it => `
      <div class="item">
        <div class="photo"><span class="e">${it.emoji || '📦'}</span></div>
        <h3>${it.name}</h3>
        ${it.desc ? `<div class="desc">${it.desc}</div>` : ''}
        ${it.memory ? `<div class="memory">『 ${it.memory} 』</div>` : ''}
        <div class="row">
          <span class="chip" style="background:${decisionColor[it.decision]}">${decisionLabel[it.decision] || it.decision}</span>
          ${it.hint ? `<span class="meta">${it.hint}</span>` : ''}
        </div>
      </div>
    `).join('')}
  `).join('')}

  ${allItems.length === 0 ? '<p style="color:#8B7355; text-align:center; padding:60px 0;">紀念冊還是空的。<br/>等你做出第一個決定，故事就開始了。</p>' : ''}

  <footer>囤積症幫手 · 你所放下的，不是回憶，是它們去新世界的允許。</footer>
</div></body></html>`;
}

// ──────── 匯出畫面 ────────
function ExportScreen({ user, rooms, giveaways, onImport, onBack }) {
  const fileInputRef = useRefE(null);
  const [importPreview, setImportPreview] = useStateE(null);

  const exportBackup = () => {
    const data = {
      _kind: 'hoarder-helper-backup',
      _version: 1,
      _exportedAt: new Date().toISOString(),
      user, rooms, giveaways,
    };
    const stamp = new Date().toISOString().slice(0,10);
    downloadBlob(JSON.stringify(data, null, 2),
                 `囤積症幫手_${user.name}_${stamp}.json`,
                 'application/json');
  };
  const exportStats = () => {
    const stamp = new Date().toISOString().slice(0,10);
    downloadBlob(buildStatsReport(user, rooms, giveaways),
                 `整理報表_${user.name}_${stamp}.html`, 'text/html');
  };
  const [memorialLayout, setMemorialLayout] = useStateE('gallery');
  const exportMemorial = (layout) => {
    const stamp = new Date().toISOString().slice(0,10);
    const lay = layout || memorialLayout;
    const layoutName = lay === 'polaroid' ? '照片牆' : lay === 'journal' ? '日記' : '相冊';
    downloadBlob(buildMemorialReport(user, rooms, lay),
                 `物品紀念冊_${layoutName}_${user.name}_${stamp}.html`, 'text/html');
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed._kind !== 'hoarder-helper-backup') {
          alert('檔案格式錯誤，不是有效的備份檔。');
          return;
        }
        setImportPreview(parsed);
      } catch (err) {
        alert('無法讀取檔案：' + err.message);
      }
    };
    reader.readAsText(f);
    e.target.value = ''; // reset so same file can be re-picked
  };

  const confirmImport = () => {
    if (!importPreview) return;
    onImport(importPreview);
    setImportPreview(null);
  };

  const totalItems = rooms.reduce((s,r) => s + r.zones.reduce((zs,z)=>zs+(z.itemList?.length||0),0), 0);
  const decidedItems = rooms.reduce((s,r) => s + r.zones.reduce((zs,z)=>zs+(z.itemList||[]).filter(it=>it.decision).length,0), 0);

  return (
    <div className="fade-in">
      <AppBar title="資料"
              en="Backup & Export"
              left={<button className="icon-btn" onClick={onBack}><Icon.back/></button>}/>

      <div className="section-tight">
        <div className="card-soft" style={{ marginBottom: 18, display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius:'50%', background:'var(--accent-soft)', display:'grid', placeItems:'center', fontSize: 22 }}>{user.emoji}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color:'var(--text)' }}>{user.name}</div>
            <div className="t-tiny">已決定 {decidedItems} / {totalItems} · {giveaways.length} 件送養</div>
          </div>
        </div>

        <h3 className="h-section" style={{ marginBottom: 10 }}>匯出 · Export</h3>
        <div className="stack-2">
          <ExportCard
            icon="💾" title="完整備份"
            en="Full backup (JSON)"
            desc="可日後匯入還原。包含所有空間、物品、決定、送養紀錄。"
            chip="可匯入" chipColor="var(--accent-deep)"
            onClick={exportBackup}/>
          <ExportCard
            icon="📊" title="整理報表"
            en="Stats report (HTML)"
            desc="統計圖表、各空間進度、送養紀錄。可瀏覽或列印分享。"
            chip="可閱讀" chipColor="var(--c-give)"
            onClick={exportStats}/>
          <ExportCard
            icon="📖" title="物品紀念冊"
            en="Item memorial (HTML)"
            desc="每件物品的詳細紀錄與你寫下的回憶。用電子的形式留住故事。"
            chip="可閱讀" chipColor="var(--c-give)"
            onClick={() => exportMemorial()}/>

          {/* Memorial layout picker */}
          <div className="card" style={{ padding: 14, background: 'var(--card-soft)' }}>
            <div className="t-tiny" style={{ marginBottom: 10 }}>紀念冊版型 · Memorial layout</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { id: 'gallery', icon: '🖼️', name: '相冊', en: 'Gallery', desc: '大圖卡片' },
                { id: 'polaroid', icon: '📷', name: '照片牆', en: 'Polaroid', desc: '拍立得格' },
                { id: 'journal', icon: '📔', name: '日記本', en: 'Journal', desc: '一物一頁' },
              ].map(opt => (
                <button key={opt.id}
                  onClick={() => setMemorialLayout(opt.id)}
                  style={{
                    padding: '12px 6px', cursor: 'pointer',
                    background: memorialLayout === opt.id ? 'var(--accent-soft)' : 'var(--card)',
                    border: '0.5px solid ' + (memorialLayout === opt.id ? 'var(--accent)' : 'var(--border)'),
                    borderRadius: 10, fontFamily: 'var(--font-body)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                  <div style={{ fontSize: 26, lineHeight: 1 }}>{opt.icon}</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{opt.name}</div>
                  <div className="t-tiny" style={{ fontSize: 9 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
            <button className="btn btn-block" style={{ marginTop: 10, fontSize: 13, padding: '10px 16px' }}
                    onClick={() => exportMemorial()}>
              下載「{memorialLayout === 'gallery' ? '相冊' : memorialLayout === 'polaroid' ? '照片牆' : '日記本'}」版本
            </button>
          </div>
        </div>

        <h3 className="h-section" style={{ marginBottom: 10, marginTop: 24 }}>匯入 · Import</h3>
        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 28 }}>📥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color:'var(--text)' }}>從備份檔還原</div>
              <div className="t-tiny">將覆蓋目前「{user.name}」的所有資料</div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept=".json,application/json"
                 onChange={handleFile} style={{ display: 'none' }}/>
          <button className="btn btn-secondary btn-block" onClick={() => fileInputRef.current?.click()}>
            選擇備份檔
          </button>
        </div>

        <div className="card-soft" style={{ marginTop: 18 }}>
          <div className="t-tiny" style={{ textWrap:'pretty' }}>
            💡 提示：匯出的檔案會直接下載到你的裝置。<br/>
            想轉移到另一台手機，把備份檔傳過去再匯入即可。
          </div>
        </div>
      </div>
      <div style={{ height: 30 }}></div>

      {importPreview && (
        <Sheet open={true} onClose={() => setImportPreview(null)}>
          <div style={{ padding:'8px 4px 4px' }}>
            <div style={{ textAlign:'center', marginBottom: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>📥</div>
              <div className="h-title" style={{ fontSize: 18 }}>確認匯入備份檔</div>
            </div>
            <div className="card-soft" style={{ marginBottom: 14, fontSize: 13, color:'var(--text-soft)' }}>
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span>使用者</span>
                <b style={{ color:'var(--text)' }}>{importPreview.user?.name || '未知'} {importPreview.user?.emoji}</b>
              </div>
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span>空間</span>
                <b style={{ color:'var(--text)' }}>{importPreview.rooms?.length || 0} 個</b>
              </div>
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span>送養紀錄</span>
                <b style={{ color:'var(--text)' }}>{importPreview.giveaways?.length || 0} 件</b>
              </div>
              <div className="row-between">
                <span>匯出時間</span>
                <b style={{ color:'var(--text)', fontSize: 12 }}>{new Date(importPreview._exportedAt).toLocaleDateString('zh-TW')}</b>
              </div>
            </div>
            <div className="t-small" style={{ marginBottom: 16, textWrap:'pretty', textAlign:'center', color:'var(--c-discard)' }}>
              目前「{user.name}」的資料會被覆蓋，無法復原。
            </div>
            <div style={{ display:'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setImportPreview(null)}>取消</button>
              <button className="btn" style={{ flex: 2 }} onClick={confirmImport}>確認匯入</button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function ExportCard({ icon, title, en, desc, chip, chipColor, onClick }) {
  return (
    <div className="card" style={{ padding: 16, cursor:'pointer', display:'flex', gap: 14, alignItems:'flex-start' }} onClick={onClick}>
      <div style={{ fontSize: 32, flexShrink: 0, lineHeight: 1 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color:'var(--text)' }}>{title}</span>
          <span className="chip" style={{ background:'transparent', color: chipColor, border: `0.5px solid ${chipColor}`, fontSize: 10 }}>{chip}</span>
        </div>
        <div className="t-tiny" style={{ marginBottom: 6 }}>{en}</div>
        <div className="t-small" style={{ fontSize: 13, textWrap:'pretty' }}>{desc}</div>
      </div>
      <div style={{ flexShrink: 0, color:'var(--muted)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>
    </div>
  );
}

window.ExportScreen = ExportScreen;
