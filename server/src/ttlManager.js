import { config } from './config.js';
import { safeLog } from './security.js';

export class TTLManager {
  constructor(onRoomExpired) {
    this.onRoomExpired = onRoomExpired; // callback function(roomId, reason)
    this.roomTimers = new Map(); // roomId -> Timeout
    this.emptyRoomTimers = new Map(); // roomId -> Timeout
  }

  /**
   * Schedules expiration timer for a room
   */
  scheduleRoomExpiry(roomId, expiresAt) {
    this.clearRoomExpiry(roomId);

    const now = Date.now();
    const delay = Math.max(0, expiresAt - now);

    const timer = setTimeout(() => {
      this.roomTimers.delete(roomId);
      safeLog.info('Room TTL expired', { roomId });
      if (this.onRoomExpired) {
        this.onRoomExpired(roomId, 'ttl_expired');
      }
    }, delay);

    this.roomTimers.set(roomId, timer);
  }

  /**
   * Clears room expiry timer
   */
  clearRoomExpiry(roomId) {
    const timer = this.roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.roomTimers.delete(roomId);
    }
  }

  /**
   * Schedules destruction for an empty room after a grace period
   */
  scheduleEmptyRoomDestruction(roomId, delayMs = config.autoDestroyEmptyAfterMs) {
    this.cancelEmptyRoomDestruction(roomId);

    const timer = setTimeout(() => {
      this.emptyRoomTimers.delete(roomId);
      safeLog.info('Empty room auto-destroyed', { roomId });
      if (this.onRoomExpired) {
        this.onRoomExpired(roomId, 'empty_room');
      }
    }, delayMs);

    this.emptyRoomTimers.set(roomId, timer);
  }

  /**
   * Cancels empty room destruction if someone joins before the grace period ends
   */
  cancelEmptyRoomDestruction(roomId) {
    const timer = this.emptyRoomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.emptyRoomTimers.delete(roomId);
    }
  }

  /**
   * Clear all timers for a room upon destruction
   */
  clearAll(roomId) {
    this.clearRoomExpiry(roomId);
    this.cancelEmptyRoomDestruction(roomId);
  }
}
