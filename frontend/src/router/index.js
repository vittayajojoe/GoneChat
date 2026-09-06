import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import CreateRoom from '../pages/CreateRoom.vue';
import JoinRoom from '../pages/JoinRoom.vue';
import ChatRoom from '../pages/ChatRoom.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/create', name: 'CreateRoom', component: CreateRoom },
  { path: '/join', name: 'JoinRoom', component: JoinRoom },
  { path: '/r/:roomId', name: 'ChatRoom', component: ChatRoom },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
