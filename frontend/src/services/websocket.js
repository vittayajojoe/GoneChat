import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this._reconnectCallback = null;
  }

  getBackendUrl() {
    return localStorage.getItem('gonechat_backend_url') || import.meta.env.VITE_BACKEND_URL || '';
  }

  setBackendUrl(url) {
    const clean = url ? url.trim().replace(/\/+$/, '') : '';
    if (clean) {
      localStorage.setItem('gonechat_backend_url', clean);
    } else {
      localStorage.removeItem('gonechat_backend_url');
    }
    this.disconnect();
  }

  connect() {
    if (!this.socket) {
      const backendUrl = this.getBackendUrl();
      console.log('[WebSocket] Connecting to:', backendUrl || 'default');
      
      this.socket = io(backendUrl || undefined, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: false,
        autoConnect: true
      });

      // Connection event listeners
      this.socket.on('connect', () => {
        console.log('[WebSocket] Connected! Socket ID:', this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error.message);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
        // Trigger reconnect callback so ChatRoom can rejoin
        if (this._reconnectCallback) {
          this._reconnectCallback(this.socket);
        }
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('[WebSocket] Reconnection attempt', attemptNumber);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('[WebSocket] Reconnection failed');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, need to reconnect manually
          this.socket.connect();
        }
      });

      this.socket.on('error', (error) => {
        console.error('[WebSocket] Socket error:', error);
      });
    }
    return this.socket;
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  /**
   * Register a callback to be called when socket reconnects.
   * Used by ChatRoom to auto-rejoin the room after reconnection.
   */
  onReconnect(callback) {
    this._reconnectCallback = callback;
  }

  /**
   * Remove the reconnect callback (cleanup)
   */
  offReconnect() {
    this._reconnectCallback = null;
  }

  /**
   * Remove specific room event listeners from the socket.
   * Call this before setting up new listeners to prevent duplicates.
   */
  removeRoomListeners() {
    if (!this.socket) return;
    const events = [
      'new_message',
      'user_joined',
      'user_left',
      'user_typing',
      'room_destroyed',
      'image_viewed'
    ];
    events.forEach(event => {
      this.socket.removeAllListeners(event);
    });
  }

  emitWithTimeout(event, data, timeoutMs = 8000) {
    return new Promise((resolve) => {
      const socket = this.getSocket();
      let isDone = false;

      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          resolve({
            success: false,
            error: 'การเชื่อมต่อไปยังเซิร์ฟเวอร์หมดเวลา กรุณาตรวจสอบว่าเซิร์ฟเวอร์ Backend ออนไลน์อยู่'
          });
        }
      }, timeoutMs);

      socket.emit(event, data, (res) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          resolve(res);
        }
      });
    });
  }

  /**
   * Create room via HTTP POST with fast timeout
   */
  async createRoomHttp({ ttl, nickname, maxParticipants }) {
    const backendUrl = this.getBackendUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${backendUrl}/api/room/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ttl, nickname, maxParticipants }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.status === 405) {
        return {
          success: false,
          needsBackendUrl: true,
          error: 'ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์ Backend (บน Cloudflare เป็นเพียงหน้าเว็บ ต้องระบุ URL ของ Node.js Server)'
        };
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.error || `HTTP ${res.status}: ไม่สามารถสร้างห้องได้` };
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return { success: false, error: 'เชื่อมต่อไปยัง Backend ไม่สำเร็จ (หมดเวลาการเชื่อมต่อ)' };
      }
      // If no backend configured or network error
      return {
        success: false,
        needsBackendUrl: true,
        error: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Backend ได้ กรุณาระบุ Server URL'
      };
    }
  }

  createRoom({ ttl, nickname, maxParticipants }) {
    return this.emitWithTimeout('create_room', { ttl, nickname, maxParticipants });
  }

  joinRoom({ roomId, nickname, ownerToken }) {
    console.log('[WebSocket] Joining room:', { roomId, nickname, hasOwnerToken: !!ownerToken });
    return this.emitWithTimeout('join_room', { roomId, nickname, ownerToken }, 10000);
  }

  sendMessage({ roomId, text, image }) {
    console.log('[WebSocket] Sending message:', { roomId, hasText: !!text, hasImage: !!image });
    // Increase timeout for images
    const timeout = image ? 30000 : 10000;
    return this.emitWithTimeout('send_message', { roomId, text, image }, timeout);
  }

  viewImage({ roomId, messageId }) {
    console.log('[WebSocket] Viewing image:', { roomId, messageId });
    return this.emitWithTimeout('view_image', { roomId, messageId }, 6000);
  }

  sendTyping({ roomId, isTyping }) {
    const socket = this.getSocket();
    socket.emit('typing', { roomId, isTyping });
  }

  burnRoom({ roomId, ownerToken }) {
    return this.emitWithTimeout('burn_room', { roomId, ownerToken }, 8000);
  }

  leaveRoom() {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: true });
      this.socket.emit('leave_room', {}, () => resolve({ success: true }));
    });
  }

  disconnect() {
    this.offReconnect();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
