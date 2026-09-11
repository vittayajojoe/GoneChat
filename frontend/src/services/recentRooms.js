// Local-only convenience list of rooms this browser has visited, so a user
// can jump back into a room they left without retyping the room ID/link.
// Stores nothing about message content — just enough to reconnect.
const STORAGE_KEY = 'gonechat_recent_rooms';
const MAX_ENTRIES = 8;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage unavailable (private mode, quota exceeded, etc.) — skip silently
  }
}

/**
 * Returns rooms that haven't expired yet, most recently visited first.
 * Expired entries are pruned from storage as a side effect.
 */
export function getRecentRooms() {
  const all = readAll();
  const alive = all.filter(r => r.expiresAt > Date.now());
  if (alive.length !== all.length) writeAll(alive);
  return alive.sort((a, b) => b.lastVisited - a.lastVisited);
}

export function rememberRoom({ roomId, nickname, expiresAt, isHost }) {
  if (!roomId || !expiresAt) return;
  const list = readAll().filter(r => r.roomId !== roomId && r.expiresAt > Date.now());
  list.unshift({ roomId, nickname, expiresAt, isHost: !!isHost, lastVisited: Date.now() });
  writeAll(list.slice(0, MAX_ENTRIES));
}

export function forgetRoom(roomId) {
  writeAll(readAll().filter(r => r.roomId !== roomId));
}
