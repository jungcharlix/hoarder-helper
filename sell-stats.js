// 囤積症幫手 — 販售統計：金額、分類、時序

const SELL_CATEGORIES = [
  { id: 'clothing', name: '衣物', color: '#C49E92', emojis: ['👕','👔','🧥','👗','🧦','👜','🎒','👠','🩲','👘','🧢'] },
  { id: 'books',    name: '書籍', color: '#94A8B8', emojis: ['📚','📖','📓','📔','📰','🗞️','📜'] },
  { id: 'electronics', name: '電器', color: '#7C8EA3', emojis: ['📱','💻','🖥️','🖱️','⌚','📺','💿','💾','🔌','🎧','📷','🔋','⚡'] },
  { id: 'kitchen', name: '廚具', color: '#D4A574', emojis: ['🍳','🥢','🥡','🫙','🍶','🥫','🧂','🧊'] },
  { id: 'furniture', name: '家具', color: '#A8956F', emojis: ['🛋️','🪑','🛏️','🪞','🖼️','🪴','🏺'] },
  { id: 'jewelry', name: '飾品', color: '#B8746B', emojis: ['💍','🎀','💄','💐','🕯️'] },
  { id: 'toys',    name: '玩具', color: '#8FAA8A', emojis: ['🧸','🧶','🎨','🪆','👶'] },
  { id: 'misc',    name: '其他', color: '#BFA98C', emojis: [] },
];

function categorize(item) {
  if (item.category) return SELL_CATEGORIES.find(c => c.id === item.category) || SELL_CATEGORIES[7];
  const emoji = item.emoji || '';
  for (const cat of SELL_CATEGORIES) {
    if (cat.emojis.includes(emoji)) return cat;
  }
  return SELL_CATEGORIES[7];
}

// Parse a price string like "NT$ 300", "600", "面交價" — returns number or 0
function parsePrice(p) {
  if (!p) return 0;
  const n = String(p).replace(/[^0-9.]/g, '');
  return n ? parseFloat(n) : 0;
}

// Parse "5/03", "5/14", "預計 5/14", "蝦皮 3 天" — returns Date or null
function parseDate(d) {
  if (!d) return null;
  const m = String(d).match(/(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  const now = new Date();
  return new Date(now.getFullYear(), parseInt(m[1]) - 1, parseInt(m[2]));
}

// Collect sell entries from rooms (decision==='sell') + custom (type==='賣')
function collectSellEntries(rooms, customGiveaways) {
  const out = [];
  for (const r of rooms) for (const z of r.zones) for (const it of (z.itemList || [])) {
    if (it.decision === 'sell') {
      out.push({
        name: it.name, emoji: it.emoji,
        price: parsePrice(it.price), priceStr: it.price || '',
        date: parseDate(it.giveDate), dateStr: it.giveDate || '',
        status: it.giveStatus || '上架中',
        category: categorize(it),
        source: 'zone', room: r.name, zone: z.name,
      });
    }
  }
  for (const g of (customGiveaways || [])) {
    if (g.type === '賣') {
      out.push({
        name: g.name, emoji: g.emoji,
        price: parsePrice(g.price), priceStr: g.price || '',
        date: parseDate(g.date), dateStr: g.date || '',
        status: g.status || '上架中',
        category: categorize(g),
        source: 'custom',
      });
    }
  }
  return out;
}

window.SELL_CATEGORIES = SELL_CATEGORIES;
window.categorize = categorize;
window.parsePrice = parsePrice;
window.parseDate = parseDate;
window.collectSellEntries = collectSellEntries;
