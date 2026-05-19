// 囤積症幫手 — 使用者管理與儲存

const USERS_KEY = 'hoarder-helper.users.v1';
const ACTIVE_USER_KEY = 'hoarder-helper.active.v1';

function _key(prefix, userId) { return `hoarder-helper.${prefix}.${userId}.v1`; }

// ─── Users list ───────────────────────────────────────
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : null;
    if (Array.isArray(arr) && arr.length > 0) return arr;
  } catch (e) {}
  // Default single user
  const defaults = [{
    id: 'u-default', name: '慢慢', emoji: '🌱',
    joined: '2026-04-12', greeting: '加入 4/12',
  }];
  saveUsers(defaults);
  return defaults;
}
function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) {}
}

function getActiveUserId() {
  try { return localStorage.getItem(ACTIVE_USER_KEY) || 'u-default'; }
  catch (e) { return 'u-default'; }
}
function setActiveUserId(id) {
  try { localStorage.setItem(ACTIVE_USER_KEY, id); } catch (e) {}
}

// ─── Per-user data ──────────────────────────────────
function loadUserRooms(userId) {
  try {
    const raw = localStorage.getItem(_key('rooms', userId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch (e) { return null; }
}
function saveUserRooms(userId, rooms) {
  try { localStorage.setItem(_key('rooms', userId), JSON.stringify(rooms)); } catch (e) {}
}

function loadUserGiveaways(userId) {
  try {
    const raw = localStorage.getItem(_key('giveaways', userId));
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveUserGiveaways(userId, arr) {
  try { localStorage.setItem(_key('giveaways', userId), JSON.stringify(arr)); } catch (e) {}
}

// Day count
function daysSince(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

// Initial seed for a brand-new user
function seedFreshUser() {
  const rooms = JSON.parse(JSON.stringify(DEFAULT_ROOMS));
  for (const r of rooms) for (const z of r.zones) {
    z.itemList = seedItemsForZone(r.name, z.name, z.items || 20);
  }
  return { rooms: recomputeRoomTotals(rooms), giveaways: [] };
}

// Delete a user's data
function deleteUserData(userId) {
  try {
    localStorage.removeItem(_key('rooms', userId));
    localStorage.removeItem(_key('giveaways', userId));
  } catch (e) {}
}

Object.assign(window, {
  USERS_KEY, ACTIVE_USER_KEY,
  loadUsers, saveUsers, getActiveUserId, setActiveUserId,
  loadUserRooms, saveUserRooms, loadUserGiveaways, saveUserGiveaways,
  daysSince, seedFreshUser, deleteUserData,
});
