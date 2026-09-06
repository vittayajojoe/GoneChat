import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomManager } from '../src/roomManager.js';
import { generateRoomId, validateMessage, RateLimiter, sanitizeNickname } from '../src/security.js';

test('Room ID generation', () => {
  const id1 = generateRoomId(16);
  const id2 = generateRoomId(16);
  assert.equal(id1.length, 16);
  assert.equal(id2.length, 16);
  assert.notEqual(id1, id2);
  assert.match(id1, /^[a-zA-Z0-9]{16}$/);
});

test('Sanitize Nickname', () => {
  assert.equal(sanitizeNickname('  Alice  '), 'Alice');
  assert.equal(sanitizeNickname(''), 'Anonymous');
  assert.equal(sanitizeNickname(null), 'Anonymous');
  const longName = 'A'.repeat(50);
  assert.equal(sanitizeNickname(longName).length, 30);
});

test('Validate Message', () => {
  assert.equal(validateMessage('   ').valid, false);
  assert.equal(validateMessage(123).valid, false);
  assert.equal(validateMessage('Hello world').valid, true);
  assert.equal(validateMessage('Hello world').text, 'Hello world');
  const tooLong = 'A'.repeat(2500);
  assert.equal(validateMessage(tooLong).valid, false);
});

test('RateLimiter sliding window', () => {
  const limiter = new RateLimiter(500, 3); // max 3 per 500ms
  assert.equal(limiter.isRateLimited('socket-1'), false);
  assert.equal(limiter.isRateLimited('socket-1'), false);
  assert.equal(limiter.isRateLimited('socket-1'), false);
  // 4th should be limited
  assert.equal(limiter.isRateLimited('socket-1'), true);
  // Different socket should not be limited
  assert.equal(limiter.isRateLimited('socket-2'), false);
});

test('RoomManager: create, join, message, and burn lifecycle', () => {
  let destroyedReason = null;
  const manager = new RoomManager((roomId, reason) => {
    destroyedReason = reason;
  });

  // 1. Create Room
  const created = manager.createRoom({ ttl: 300, nickname: 'HostUser' });
  assert.ok(created.roomId);
  assert.ok(created.ownerToken);
  assert.equal(created.ttlSeconds, 300);

  const room = manager.getRoom(created.roomId);
  assert.ok(room);
  assert.equal(room.users.size, 0);

  // 2. Join Room as Host
  const joinHost = manager.joinRoom(created.roomId, 'socket-host', 'HostUser', created.ownerToken);
  assert.equal(joinHost.success, true);
  assert.equal(joinHost.user.isHost, true);

  // 3. Join Room as Guest
  const joinGuest = manager.joinRoom(created.roomId, 'socket-guest', 'GuestUser', null);
  assert.equal(joinGuest.success, true);
  assert.equal(joinGuest.user.isHost, false);
  assert.equal(manager.getRoom(created.roomId).users.size, 2);

  // 4. Send Messages
  const msg1 = manager.addMessage(created.roomId, 'socket-host', 'Hello from host');
  assert.ok(msg1);
  assert.equal(msg1.text, 'Hello from host');
  assert.equal(msg1.senderName, 'HostUser');

  const msg2 = manager.addMessage(created.roomId, 'socket-guest', 'Hi host!');
  assert.ok(msg2);
  assert.equal(msg2.text, 'Hi host!');

  // Verify memory messages
  assert.equal(manager.getRoom(created.roomId).messages.length, 2);

  // 5. Unauthorized Burn Attempt (Guest tries to burn room)
  const guestBurn = manager.burnRoom(created.roomId, 'socket-guest', 'invalid-token');
  assert.equal(guestBurn.success, false);
  assert.ok(manager.getRoom(created.roomId)); // Room still exists

  // 6. Authorized Burn Attempt (Host burns room)
  const hostBurn = manager.burnRoom(created.roomId, 'socket-host', created.ownerToken);
  assert.equal(hostBurn.success, true);

  // 7. Verify Room is completely erased from RAM
  assert.equal(manager.getRoom(created.roomId), null);
  assert.equal(manager.rooms.has(created.roomId), false);
  assert.equal(destroyedReason, 'room_burned');
});
