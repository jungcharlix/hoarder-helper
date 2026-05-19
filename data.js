// 囤積症幫手 — 資料定義
// Rooms, zones, sample items, achievements, encouragement phrases

const DEFAULT_ROOMS = [
  {
    id: 'living', name: '客廳', enName: 'Living Room',
    layout: { col: 1, row: 1, w: 2, h: 1 },
    zones: [
      { id: 'living-1', name: '沙發區', items: 20, decided: 0 },
      { id: 'living-2', name: '電視櫃', items: 20, decided: 0 },
      { id: 'living-3', name: '茶几與地面', items: 20, decided: 0 },
      { id: 'living-4', name: '書架收納', items: 20, decided: 0 },
    ],
  },
  {
    id: 'bath1', name: '浴室一', enName: 'Bath 1',
    layout: { col: 3, row: 1, w: 1, h: 1 },
    zones: [{ id: 'bath1-1', name: '整體', items: 20, decided: 0 }],
  },
  {
    id: 'bath2', name: '浴室二', enName: 'Bath 2',
    layout: { col: 3, row: 2, w: 1, h: 1 },
    zones: [{ id: 'bath2-1', name: '整體', items: 20, decided: 0 }],
  },
  {
    id: 'master', name: '主臥室', enName: 'Master',
    layout: { col: 1, row: 2, w: 2, h: 1 },
    zones: [
      { id: 'master-1', name: '床頭與床下', items: 20, decided: 0 },
      { id: 'master-2', name: '衣櫃', items: 20, decided: 0 },
      { id: 'master-3', name: '化妝台', items: 20, decided: 0 },
      { id: 'master-4', name: '書桌與椅', items: 20, decided: 0 },
    ],
  },
  {
    id: 'second', name: '次臥室', enName: 'Guest Room',
    layout: { col: 1, row: 3, w: 2, h: 1 },
    zones: [
      { id: 'second-1', name: '床頭與床下', items: 20, decided: 0 },
      { id: 'second-2', name: '衣櫃', items: 20, decided: 0 },
      { id: 'second-3', name: '書桌', items: 20, decided: 0 },
      { id: 'second-4', name: '地板與雜物', items: 20, decided: 0 },
    ],
  },
  {
    id: 'pc', name: '電腦房', enName: 'Office',
    layout: { col: 3, row: 3, w: 1, h: 1 },
    zones: [
      { id: 'pc-1', name: '主桌面', items: 20, decided: 0 },
      { id: 'pc-2', name: '抽屜', items: 20, decided: 0 },
      { id: 'pc-3', name: '主機線材', items: 20, decided: 0 },
      { id: 'pc-4', name: '書架', items: 20, decided: 0 },
    ],
  },
  {
    id: 'small', name: '小房間', enName: 'Small Rm',
    layout: { col: 3, row: 4, w: 1, h: 1 },
    zones: [
      { id: 'small-1', name: '左半邊', items: 20, decided: 0 },
      { id: 'small-2', name: '右半邊', items: 20, decided: 0 },
    ],
  },
  {
    id: 'kitchen', name: '廚房', enName: 'Kitchen',
    layout: { col: 1, row: 4, w: 2, h: 1 },
    zones: [
      { id: 'kitchen-1', name: '流理台櫥櫃', items: 20, decided: 0 },
      { id: 'kitchen-2', name: '冰箱儲物', items: 20, decided: 0 },
    ],
  },
  {
    id: 'storage', name: '倉庫', enName: 'Storage',
    layout: { col: 1, row: 5, w: 3, h: 2 },
    zones: Array.from({ length: 20 }, (_, i) => ({
      id: `storage-${i + 1}`,
      name: `第 ${i + 1} 區`,
      items: 20, decided: 0,
    })),
  },
  {
    id: 'balcony', name: '陽台', enName: 'Balcony',
    layout: { col: 1, row: 7, w: 3, h: 1 },
    zones: [
      { id: 'balcony-1', name: '洗衣區', items: 20, decided: 0 },
      { id: 'balcony-2', name: '植物區', items: 20, decided: 0 },
      { id: 'balcony-3', name: '雜物區', items: 20, decided: 0 },
      { id: 'balcony-4', name: '收納櫃', items: 20, decided: 0 },
      { id: 'balcony-5', name: '地面與走道', items: 20, decided: 0 },
    ],
  },
];

// Compute totals
function recomputeRoomTotals(rooms){
  rooms.forEach(r => {
    r.totalItems = r.zones.reduce((s, z) => s + (z.items || 0), 0);
    r.totalDecided = r.zones.reduce((s, z) => s + (z.decided || 0), 0);
    r.totalZones = r.zones.length;
    r.completedZones = r.zones.filter(z => (z.decided || 0) >= (z.items || 0) && z.items > 0).length;
  });
  return rooms;
}
recomputeRoomTotals(DEFAULT_ROOMS);
let ROOMS = DEFAULT_ROOMS;

const ALL_ZONES_COUNT_DEFAULT = DEFAULT_ROOMS.reduce((s, r) => s + r.zones.length, 0);

// Sample items for the cleaning flow demo (current zone: 茶几與地面)
const SAMPLE_ITEMS = [
  {
    id: 'i1', emoji: '📰',
    name: '舊報紙（2019年）',
    enName: 'Old newspapers',
    desc: '一疊已泛黃的報紙，上面還壓著一個空馬克杯。',
    hint: '已超過 6 年，內容不會再讀。',
    memory: '那年家人剛搬來，我喜歡早上邊喝茶邊讀。',
  },
  {
    id: 'i2', emoji: '🎁',
    name: '未拆封的禮品',
    enName: 'Unopened gift',
    desc: '同事 2022 年送的香氛蠟燭，盒子完好。',
    hint: '兩年未使用，仍可轉送他人。',
    memory: '謝謝對方記得我的生日。',
  },
  {
    id: 'i3', emoji: '📚',
    name: '大學筆記',
    enName: 'College notes',
    desc: '微積分課本與三本筆記，封面有點受潮。',
    hint: '已不從事相關工作，紙本內容亦可拍照存檔。',
    memory: '熬夜算題的那些晚上。',
  },
  {
    id: 'i4', emoji: '🧸',
    name: '小熊玩偶',
    enName: 'Teddy bear',
    desc: '童年的小熊，有些褪色但完好。',
    hint: '若有強烈情感連結，可保留一個收納位置。',
    memory: '六歲生日收到的，那時候總抱著睡。',
  },
  {
    id: 'i5', emoji: '🕯️',
    name: '半截蠟燭',
    enName: 'Half-used candle',
    desc: '香味已淡，蠟燭芯燒得不整齊。',
    hint: '可重新熔製或回收。',
    memory: '',
  },
  {
    id: 'i6', emoji: '👕',
    name: '尺寸不合的襯衫',
    enName: 'Ill-fitting shirt',
    desc: '兩年前買的襯衫，現在穿不下。',
    hint: '可捐贈或上架二手平台。',
    memory: '原本想瘦下來再穿。',
  },
];

// Achievement / badge system
const BADGES = [
  { id: 'b1', name: '初次決定', desc: '完成第一個物品的決定', icon: '🌱', earned: true, date: '2026-04-12' },
  { id: 'b2', name: '十全十美', desc: '一次處理 10 件物品', icon: '✨', earned: true, date: '2026-04-15' },
  { id: 'b3', name: '一區完成', desc: '完成第一個區域', icon: '🎋', earned: true, date: '2026-04-22' },
  { id: 'b4', name: '七日連線', desc: '連續整理 7 天', icon: '🌸', earned: true, date: '2026-05-02' },
  { id: 'b5', name: '送出溫暖', desc: '送出 20 件物品給他人', icon: '🎁', earned: true, date: '2026-05-06' },
  { id: 'b6', name: '客廳完工', desc: '完成整個客廳區域', icon: '🛋️', earned: false },
  { id: 'b7', name: '主臥之主', desc: '完成整個主臥室', icon: '🛏️', earned: false },
  { id: 'b8', name: '半屋通透', desc: '完成全屋 50% 區域', icon: '🪟', earned: false },
  { id: 'b9', name: '勇敢釋懷', desc: '為 5 件物品寫下回憶後放下', icon: '🕊️', earned: true, date: '2026-04-30' },
  { id: 'b10', name: '百日整理', desc: '使用 App 滿 100 天', icon: '🌳', earned: false },
];

// Encouragement phrases (varied by intensity)
const ENCOURAGEMENT = {
  gentle: [
    '今天願意打開 App，就已經是溫柔的一步。',
    '不急，我們慢慢來。',
    '一件就好，不必更多。',
    '你不是在丟掉回憶，是讓它換個方式陪你。',
  ],
  warm: [
    '你做得真好，每一個決定都需要勇氣。',
    '看著家裡慢慢變寬敞，那感覺真的很棒。',
    '今天的努力，未來的你會謝謝現在的你。',
    '允許自己留下重要的，也允許自己放下沉重的。',
  ],
  strong: [
    '你做到了！這是真實的進步。',
    '你正在重新拿回家的主導權，真的很厲害。',
    '每一個決定，都讓家更像家。',
    '你比想像中堅強，今天又證明一次。',
  ],
};

// Give-away listings
const GIVEAWAY_LIST = [
  { id: 'g1', name: '香氛蠟燭（未拆封）', type: '送', status: '已聯絡', recipient: '同事 A', date: '預計 5/14' },
  { id: 'g2', name: '日文小說 3 本', type: '送', status: '已送出', recipient: '社區圖書角', date: '5/08' },
  { id: 'g3', name: '純棉襯衫（M 號）', type: '賣', status: '上架中', price: 'NT$ 280', date: '蝦皮 · 3 天' },
  { id: 'g4', name: '陶瓷花瓶', type: '賣', status: '待拍照', price: 'NT$ 450', date: '' },
  { id: 'g5', name: '電子體重計', type: '送', status: '待聯絡', recipient: '社區公告', date: '' },
  { id: 'g6', name: '兒童繪本套組', type: '送', status: '已送出', recipient: '鄰居 B', date: '5/05' },
  { id: 'g7', name: '無線藍牙音箱', type: '賣', status: '已售出', price: 'NT$ 600', date: '5/03' },
];

// History entries
const HISTORY = [
  { date: '今天', zone: '茶几與地面', room: '客廳', kept: 5, discarded: 2, given: 1, pending: 0 },
  { date: '昨天', zone: '電視櫃', room: '客廳', kept: 14, discarded: 6, given: 2, pending: 0 },
  { date: '5/09', zone: '床頭與床下', room: '主臥室', kept: 18, discarded: 7, given: 2, pending: 0 },
  { date: '5/08', zone: '沙發區', room: '客廳', kept: 10, discarded: 3, given: 1, pending: 0 },
  { date: '5/06', zone: '植物區', room: '陽台', kept: 11, discarded: 2, given: 1, pending: 0 },
  { date: '5/05', zone: '整體', room: '浴室一', kept: 14, discarded: 8, given: 2, pending: 0 },
];

// Upcoming reminders / scheduled
const SCHEDULE = [
  { date: '今天', day: '週二', time: '20:00', zone: '茶几與地面', room: '客廳', duration: '30 分鐘', state: 'now' },
  { date: '明天', day: '週三', time: '20:00', zone: '書架收納', room: '客廳', duration: '45 分鐘', state: 'upcoming' },
  { date: '5/14', day: '週四', time: '19:30', zone: '化妝台', room: '主臥室', duration: '30 分鐘', state: 'upcoming' },
  { date: '5/15', day: '週五', time: '20:00', zone: '書桌與椅', room: '主臥室', duration: '30 分鐘', state: 'upcoming' },
  { date: '5/17', day: '週日', time: '10:00', zone: '衣櫃', room: '次臥室', duration: '60 分鐘', state: 'upcoming' },
];

Object.assign(window, {
  DEFAULT_ROOMS, ROOMS, recomputeRoomTotals, ALL_ZONES_COUNT_DEFAULT,
  SAMPLE_ITEMS, BADGES, ENCOURAGEMENT, GIVEAWAY_LIST, HISTORY, SCHEDULE,
});
