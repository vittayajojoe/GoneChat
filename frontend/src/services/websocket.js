import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
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

  createRoom({ ttl, nickname, maxParticipants }) {
    return new Promise((resolve) => {
      const socket = this.getSocket();
      socket.emit('create_room', { ttl, nickname, maxParticipants }, (res) => {
        resolve(res);
      });
    });
  }

  joinRoom({ roomId, nickname, ownerToken }) {
    return new Promise((resolve) => {
      const socket = this.getSocket();
      socket.emit('join_room', { roomId, nickname, ownerToken }, (res) => {
        resolve(res);
      });
    });
  }

  sendMessage({ roomId, text }) {
    return new Promise((resolve) => {
      const socket = this.getSocket();
      socket.emit('send_message', { roomId, text }, (res) => {
        resolve(res);
      });
    });
  }

  sendTyping({ roomId, isTyping }) {
    const socket = this.getSocket();
    socket.emit('typing', { roomId, isTyping });
  }

  burnRoom({ roomId, ownerToken }) {
    return new Promise((resolve) => {
      const socket = this.getSocket();
      socket.emit('burn_room', { roomId, ownerToken }, (res) => {
        resolve(res);
      });
    });
  }

  leaveRoom() {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: true });
      this.socket.emit('leave_room', {}, (res) => {
        resolve(res);
      });
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
