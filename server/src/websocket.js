import { Server } from 'socket.io';
import { RoomManager } from './roomManager.js';
import { RateLimiter, validateMessage, safeLog } from './security.js';
import { config } from './config.js';

export function setupWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 25000
  });

  const rateLimiter = new RateLimiter();

  // Initialize RoomManager with callback for destroyed rooms
  const roomManager = new RoomManager((roomId, reason, affectedSockets) => {
    safeLog.info('Broadcasting room destruction to clients', { roomId, reason });
    io.to(roomId).emit('room_destroyed', {
      roomId,
      reason,
      message: reason === 'room_burned'
        ? '🔥 This room was burned by the host. All data has vanished from server RAM.'
        : reason === 'ttl_expired'
          ? '💨 This room has expired. There is no conversation history.'
          : 'Room has been closed.'
    });

    // Make all sockets leave this room channel
    io.in(roomId).socketsLeave(roomId);
  });

  io.on('connection', (socket) => {
    safeLog.info('Client connected', { socketId: socket.id });

    // 1. Create Room
    socket.on('create_room', (data, callback) => {
      try {
        const { ttl, nickname, maxParticipants } = data || {};
        const result = roomManager.createRoom({ ttl, nickname, maxParticipants });
        if (typeof callback === 'function') {
          callback({ success: true, ...result });
        }
      } catch (err) {
        safeLog.error('Error creating room', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Failed to create room' });
        }
      }
    });

    // 2. Join Room
    socket.on('join_room', (data, callback) => {
      try {
        const { roomId, nickname, ownerToken, clientId } = data || {};
        if (!roomId) {
          if (typeof callback === 'function') callback({ success: false, error: 'Room ID is required' });
          return;
        }

        const joinResult = roomManager.joinRoom(roomId, socket.id, nickname, ownerToken, clientId);
        if (!joinResult.success) {
          if (typeof callback === 'function') callback({ success: false, error: joinResult.error });
          return;
        }

        socket.join(roomId);

        // Broadcast to others in the room
        socket.to(roomId).emit('user_joined', {
          user: {
            socketId: socket.id,
            nickname: joinResult.user.nickname,
            isHost: joinResult.user.isHost
          },
          userCount: joinResult.roomInfo.userCount,
          users: joinResult.roomInfo.users
        });

        if (typeof callback === 'function') {
          callback({ success: true, ...joinResult.roomInfo, myUser: joinResult.user });
        }
      } catch (err) {
        safeLog.error('Error joining room', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Internal server error while joining' });
        }
      }
    });

    // 3. Send Message
    socket.on('send_message', (data, callback) => {
      try {
        safeLog.info('Received send_message event', { socketId: socket.id, roomId: data?.roomId, hasImage: !!data?.image });
        
        // Rate limiting check
        if (rateLimiter.isRateLimited(socket.id)) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Slow down! Too many messages per second.' });
          }
          return;
        }

        const { roomId, text, image } = data || {};
        
        // Validate text if present
        if (text && text.trim()) {
          const validation = validateMessage(text);
          if (!validation.valid) {
            safeLog.warn('Invalid message', { socketId: socket.id, error: validation.error });
            if (typeof callback === 'function') {
              callback({ success: false, error: validation.error });
            }
            return;
          }
        }

        // Validate image size (max 5MB base64)
        if (image && image.length > 5 * 1024 * 1024) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Image too large (max 5MB)' });
          }
          return;
        }

        const messageText = text?.trim() || (image ? '📷 รูปภาพ' : '');
        const message = roomManager.addMessage(roomId, socket.id, messageText, image);
        
        if (!message) {
          safeLog.warn('Failed to add message', { socketId: socket.id, roomId });
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Room no longer exists or you are not in this room' });
          }
          return;
        }

        // Broadcast message to everyone in room (including sender)
        safeLog.info('Broadcasting message', { roomId, messageId: message.id, recipients: io.sockets.adapter.rooms.get(roomId)?.size });
        io.to(roomId).emit('new_message', message);

        if (typeof callback === 'function') {
          callback({ success: true, messageId: message.id });
        }
      } catch (err) {
        safeLog.error('Error sending message', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Could not send message' });
        }
      }
    });

    // 3b. View Image
    socket.on('view_image', (data, callback) => {
      try {
        const { roomId, messageId } = data || {};
        const message = roomManager.incrementImageView(roomId, messageId, socket.id);
        
        if (!message) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Message not found' });
          }
          return;
        }

        // Broadcast view count update to room
        io.to(roomId).emit('image_viewed', {
          messageId: message.id,
          viewCount: message.image?.viewCount || 0,
          expired: message.image?.expired || false
        });

        if (typeof callback === 'function') {
          callback({ 
            success: true, 
            viewCount: message.image?.viewCount || 0,
            expired: message.image?.expired || false
          });
        }
      } catch (err) {
        safeLog.error('Error viewing image', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Could not view image' });
        }
      }
    });

    // 4. Typing Indicator
    socket.on('typing', (data) => {
      const { roomId, isTyping } = data || {};
      if (!roomId) return;
      const room = roomManager.getRoom(roomId);
      if (!room) return;
      const user = room.users.get(socket.id);
      if (!user) return;

      socket.to(roomId).emit('user_typing', {
        socketId: socket.id,
        nickname: user.nickname,
        isTyping: Boolean(isTyping)
      });
    });

    // 5. Burn Room
    socket.on('burn_room', (data, callback) => {
      try {
        const { roomId, ownerToken } = data || {};
        const result = roomManager.burnRoom(roomId, socket.id, ownerToken);
        if (typeof callback === 'function') {
          callback(result);
        }
      } catch (err) {
        safeLog.error('Error burning room', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Failed to burn room' });
        }
      }
    });

    // 6. Leave Room
    socket.on('leave_room', (data, callback) => {
      const leaveResult = roomManager.leaveRoom(socket.id);
      if (leaveResult) {
        socket.leave(leaveResult.roomId);
        socket.to(leaveResult.roomId).emit('user_left', {
          user: leaveResult.leavingUser,
          userCount: leaveResult.remainingUsers.length,
          users: leaveResult.remainingUsers
        });
      }
      if (typeof callback === 'function') {
        callback({ success: true });
      }
    });

    // 7. Disconnect
    socket.on('disconnect', () => {
      rateLimiter.remove(socket.id);
      const leaveResult = roomManager.leaveRoom(socket.id);
      if (leaveResult) {
        socket.to(leaveResult.roomId).emit('user_left', {
          user: leaveResult.leavingUser,
          userCount: leaveResult.remainingUsers.length,
          users: leaveResult.remainingUsers
        });
      }
      safeLog.info('Client disconnected', { socketId: socket.id });
    });
  });

  return { io, roomManager };
}
