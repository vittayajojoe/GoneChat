import crypto from 'node:crypto';
import { config } from './config.js';

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a high-entropy cryptographically secure room ID
 * Example: a8F2kL9xPq7Z4mT6
 */
export function generateRoomId(length = 16) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC_CHARS[bytes[i] % ALPHANUMERIC_CHARS.length];
  }
  return result;
}

/**
 * Generates a secure token for room ownership / burning authorization
 */
export function generateOwnerToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sanitizes and validates user nickname
 */
export function sanitizeNickname(rawNickname) {
  if (typeof rawNickname !== 'string') return 'Anonymous';
  const clean = rawNickname.trim().replace(/[\r\n\t]/g, '');
  if (!clean) return 'Anonymous';
  return clean.slice(0, config.maxNicknameLength);
}

/**
 * Validates chat message content
 */
export function validateMessage(rawText) {
  if (typeof rawText !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }
  const clean = rawText.trim();
  if (clean.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (clean.length > config.maxMessageLength) {
    return { valid: false, error: `Message exceeds maximum length of ${config.maxMessageLength} characters` };
  }
  return { valid: true, text: clean };
}

/**
 * In-memory sliding window rate limiter per socket ID
 */
export class RateLimiter {
  constructor(windowMs = config.rateLimit.windowMs, maxAllowed = config.rateLimit.maxMessages) {
    this.windowMs = windowMs;
    this.maxAllowed = maxAllowed;
    this.clients = new Map();
  }

  isRateLimited(key) {
    const now = Date.now();
    let timestamps = this.clients.get(key) || [];
    // Filter timestamps within current window
    timestamps = timestamps.filter(t => now - t < this.windowMs);

    if (timestamps.length >= this.maxAllowed) {
      this.clients.set(key, timestamps);
      return true;
    }

    timestamps.push(now);
    this.clients.set(key, timestamps);
    return false;
  }

  remove(key) {
    this.clients.delete(key);
  }
}

/**
 * Safe logger that complies with Privacy Guarantee:
 * NEVER logs message content, only operational metadata (event name, room ID, user count).
 */
export const safeLog = {
  info(msg, meta = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${msg}`, JSON.stringify(meta));
  },
  warn(msg, meta = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${msg}`, JSON.stringify(meta));
  },
  error(msg, error = {}) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${msg}`, error?.message || error);
  }
};
