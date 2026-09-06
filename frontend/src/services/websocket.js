import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  getBackendUrl() {
    return import.meta.env.VITE_BACKEND_URL || '';
  }

  connect() {
    if (!this.socket) {
      const backendUrl = this.getBackendUrl();
      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
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
      // Fallback to WebSocket emit if HTTP route fails
      return this.createRoom({ ttl, nickname, maxParticipants });
    }
  }

  createRoom({ ttl, nickname, maxParticipants }) {
    return this.emitWithTimeout('create_room', { ttl, nickname, maxParticipants });
  }

  joinRoom({ roomId, nickname, ownerToken }) {
    return this.emitWithTimeout('join_room', { roomId, nickname, ownerToken }, 10000);
  }

  sendMessage({ roomId, text }) {
    return this.emitWithTimeout('send_message', { roomId, text }, 6000);
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
