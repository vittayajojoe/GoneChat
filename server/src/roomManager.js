import { config } from './config.js';
import { generateRoomId, generateOwnerToken, sanitizeNickname, safeLog } from './security.js';
import { TTLManager } from './ttlManager.js';

export class RoomManager {
  constructor(onRoomDestroyed) {
    this.rooms = new Map(); // roomId -> Room object
    this.socketToRoom = new Map(); // socketId -> roomId
    this.onRoomDestroyed = onRoomDestroyed; // Callback(roomId, reason, disconnectedSockets)
    this.ttlManager = new TTLManager((roomId, reason) => {
      this.destroyRoom(roomId, reason);
    });
  }

  /**
   * Creates a new temporary room in server RAM
   */
  createRoom({ ttl = config.defaultTTL, nickname = 'Host', maxParticipants = config.maxParticipants } = {}) {
    // Validate TTL
    const validTTL = Math.min(Math.max(Number(ttl) || config.defaultTTL, config.minRoomTTL), config.maxRoomTTL);
    const roomId = generateRoomId(16);
    const ownerToken = generateOwnerToken();
    const now = Date.now();
    const expiresAt = now + validTTL * 1000;

    const room = {
      id: roomId,
      createdAt: now,
      expiresAt: expiresAt,
      ttlSeconds: validTTL,
      ownerToken: ownerToken,
      ownerSocketId: null,
      maxParticipants: Math.min(Number(maxParticipants) || config.maxParticipants, config.maxParticipants),
      users: new Map(), // socketId -> { socketId, nickname, joinedAt, isHost }
      messages: [] // Ephemeral in-memory only message buffer (capped at 100)
    };

    this.rooms.set(roomId, room);
    this.ttlManager.scheduleRoomExpiry(roomId, expiresAt);

    // If no one joins within 2 minutes of creation, auto-destroy to prevent ghost rooms
    this.ttlManager.scheduleEmptyRoomDestruction(roomId, 120000);

    safeLog.info('Room created', { roomId, ttlSeconds: validTTL });

    return {
      roomId,
      ownerToken,
      expiresAt,
      ttlSeconds: validTTL
    };
  }

  /**
   * Checks if room exists and is not expired
   */
  getRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (Date.now() >= room.expiresAt) {
      this.destroyRoom(roomId, 'ttl_expired');
      return null;
    }
    return room;
  }

  /**
   * Adds a user to a room
   */
  joinRoom(roomId, socketId, rawNickname, clientOwnerToken = null) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Room does not exist or has expired' };
    }

    if (room.users.size >= room.maxParticipants) {
      return { success: false, error: 'Room is full' };
    }

    // Cancel empty room auto-destruction if any
    this.ttlManager.cancelEmptyRoomDestruction(roomId);

    const nickname = sanitizeNickname(rawNickname);
    const isHost = clientOwnerToken === room.ownerToken || room.users.size === 0;
    if (isHost && !room.ownerSocketId) {
      room.ownerSocketId = socketId;
    }

    const user = {
      socketId,
      nickname,
      joinedAt: Date.now(),
      isHost
    };

    room.users.set(socketId, user);
    this.socketToRoom.set(socketId, roomId);

    safeLog.info('User joined room', { roomId, userCount: room.users.size, isHost });

    return {
      success: true,
      user,
      roomInfo: {
        id: room.id,
        createdAt: room.createdAt,
        expiresAt: room.expiresAt,
        ttlSeconds: room.ttlSeconds,
        isHost,
        userCount: room.users.size,
        users: Array.from(room.users.values()).map(u => ({
          socketId: u.socketId,
          nickname: u.nickname,
          isHost: u.isHost
        })),
        recentMessages: room.messages.slice(-50)
      }
    };
  }

  /**
   * Handles user leaving or socket disconnecting
   */
  leaveRoom(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const leavingUser = room.users.get(socketId);
    room.users.delete(socketId);

    safeLog.info('User left room', { roomId, remainingUsers: room.users.size });

    // If host left and other users remain, promote first joined user as host
    if (leavingUser?.isHost && room.users.size > 0) {
      const nextHost = room.users.values().next().value;
      if (nextHost) {
        nextHost.isHost = true;
        room.ownerSocketId = nextHost.socketId;
      }
    }

    // If room is empty, schedule auto-destruction
    if (room.users.size === 0) {
      this.ttlManager.scheduleEmptyRoomDestruction(roomId);
    }

    return {
      roomId,
      leavingUser,
      remainingUsers: Array.from(room.users.values()).map(u => ({
        socketId: u.socketId,
        nickname: u.nickname,
        isHost: u.isHost
      }))
    };
  }

  /**
   * Adds an ephemeral message to the room buffer
   */
  addMessage(roomId, socketId, text, imageData = null) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const user = room.users.get(socketId);
    if (!user) return null;

    const message = {
      id: generateRoomId(12),
      senderId: socketId,
      senderName: user.nickname,
      nickname: user.nickname, // For backward compatibility
      text: text,
      timestamp: Date.now(),
      image: imageData ? {
        data: imageData,
        viewCount: 0,
        maxViews: 2
      } : null
    };

    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages.shift(); // Keep only last 100 messages in RAM
    }

    return message;
  }

  /**
   * Increment view count for an image message
   */
  incrementImageView(roomId, messageId, viewerSocketId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const message = room.messages.find(m => m.id === messageId);
    if (!message || !message.image) return null;

    // Don't count sender's own views
    if (message.senderId === viewerSocketId) {
      return message;
    }

    message.image.viewCount++;
    
    // If max views reached, delete image data
    if (message.image.viewCount >= message.image.maxViews) {
      message.image.data = null;
      message.image.expired = true;
    }

    return message;
  }

  /**
   * Destroys a room immediately (Burn Room or Expiration)
   */
  destroyRoom(roomId, reason = 'manual_burn') {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // Clear all scheduled timers
    this.ttlManager.clearAll(roomId);

    // Collect affected sockets
    const affectedSockets = Array.from(room.users.keys());
    for (const socketId of affectedSockets) {
      this.socketToRoom.delete(socketId);
    }

    // Completely erase room data and messages from RAM
    room.users.clear();
    room.messages = [];
    this.rooms.delete(roomId);

    safeLog.info('Room completely wiped from RAM', { roomId, reason, affectedSockets: affectedSockets.length });

    if (this.onRoomDestroyed) {
      this.onRoomDestroyed(roomId, reason, affectedSockets);
    }

    return true;
  }

  /**
   * Allows host or authorized token holder to burn the room
   */
  burnRoom(roomId, socketId, ownerToken = null) {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room does not exist' };

    const user = room.users.get(socketId);
    const isOwner = (user && user.isHost) || (ownerToken && ownerToken === room.ownerToken);

    if (!isOwner) {
      return { success: false, error: 'Only the room host can burn the room' };
    }

    const success = this.destroyRoom(roomId, 'room_burned');
    return { success };
  }

  /**
   * Returns current active rooms count for health/monitoring
   */
  getStats() {
    let totalUsers = 0;
    for (const room of this.rooms.values()) {
      totalUsers += room.users.size;
    }
    return {
      activeRooms: this.rooms.size,
      connectedUsers: totalUsers
    };
  }
}
