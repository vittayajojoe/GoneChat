import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { wsService } from './services/websocket.js';
import './style.css';

// Ping the backend immediately on load so a sleeping Render instance starts
// waking up in the background, before the user gets anywhere near a submit
// button that would otherwise time out waiting for it.
wsService.wakeBackend();

const app = createApp(App);
app.use(router);
app.mount('#app');
