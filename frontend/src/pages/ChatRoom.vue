<template>
  <div class="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
    <!-- Inline Nickname Prompt Modal if opened via direct link without nickname -->
    <div
      v-if="needsNicknamePrompt"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        <div class="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
          <Flame class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <h3 class="text-lg font-bold text-slate-100">เข้าร่วมการสนทนา</h3>
          <p class="text-xs text-slate-400">เลือกชื่อเล่นชั่วคราวเพื่อเข้าสู่ห้องแชท</p>
        </div>

        <div class="relative flex items-center">
          <input
            v-model="promptNickname"
            type="text"
            maxlength="30"
            placeholder="กรอกชื่อเล่น หรือกดสุ่ม"
            class="w-full bg-slate-800 border border-slate-700 focus:border-rose-500 rounded-2xl py-3 px-4 pr-11 text-sm text-slate-100 outline-none"
            @keydown.enter="submitPromptNickname"
          />
          <button
            type="button"
            @click="promptNickname = generateRandomNickname()"
            class="absolute right-2 p-1.5 text-slate-400 hover:text-rose-400 rounded-xl"
            title="สุ่มชื่อเล่นใหม่"
          >
            <Dices class="w-4 h-4" />
          </button>
        </div>

        <div v-if="joinError" class="text-xs text-rose-400">{{ joinError }}</div>

        <button
          @click="submitPromptNickname"
          class="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
        >
          เข้าสู่ห้องแชท
        </button>
      </div>
    </div>

    <!-- Top Navigation Bar -->
    <header class="h-16 shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between z-10">
      <!-- Left: Brand & Status -->
      <div class="flex items-center gap-2.5">
        <router-link to="/" class="flex items-center gap-1.5 group" title="GoneChat หน้าแรก">
          <div class="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
            <Flame class="w-4 h-4" />
          </div>
          <span class="font-bold text-sm tracking-tight text-slate-100 hidden sm:inline">GoneChat</span>
        </router-link>

        <div class="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>

        <div class="flex items-center gap-1.5 text-xs text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium hidden xs:inline">ออนไลน์</span>
        </div>
      </div>

      <!-- Center: Live Room Timer -->
      <div v-if="roomInfo && roomInfo.expiresAt">
        <RoomTimer :expiresAt="roomInfo.expiresAt" @expired="handleRoomExpired" />
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-1.5">
        <!-- Participants Button -->
        <button
          @click="showUserList = true"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
          title="ผู้เข้าร่วมในห้อง"
        >
          <Users class="w-4 h-4" />
          <span
            v-if="userList.length > 0"
            class="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-slate-800 text-[10px] font-bold rounded-full text-slate-300 border border-slate-700"
          >
            {{ userList.length }}
          </span>
        </button>

        <!-- Share QR Button -->
        <button
          @click="showQRModal = true"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="แชร์ QR Code / ลิงก์ห้อง"
        >
          <QrCode class="w-4 h-4" />
        </button>

        <!-- Burn Room Button -->
        <button
          @click="showBurnModal = true"
          class="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 transition-all"
          title="ทำลายห้องทันที"
        >
          <Flame class="w-3.5 h-3.5" />
          <span class="hidden md:inline">ทำลายห้อง</span>
        </button>

        <!-- Exit Button -->
        <button
          @click="handleExit"
          class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="ออกจากห้อง"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- Chat Messages Scroll Area -->
    <main
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth select-text"
    >
      <!-- Privacy Reminder Banner in Room -->
      <div class="max-w-md mx-auto my-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center space-y-1">
        <p class="text-xs font-semibold text-rose-400 flex items-center justify-center gap-1.5">
          <ShieldAlert class="w-3.5 h-3.5" />
          การสนทนาชั่วคราว
        </p>
        <p class="text-[11px] text-slate-400 leading-snug">
          ไม่มีการบันทึกประวัติ ข้อความอยู่ในหน่วยความจำ RAM เท่านั้น และจะหายไปทันทีเมื่อกดออกจากห้อง หมดเวลา หรือกดทำลายห้อง
        </p>
      </div>

      <!-- Messages list -->
      <ChatMessage
        v-for="msg in messages"
        :key="msg.id || msg.timestamp"
        :message="msg"
        :currentSocketId="currentSocketId"
      />

      <!-- Typing Indicator -->
      <div v-if="typingUser" class="flex items-center gap-2 py-1 px-2 text-xs text-slate-400 italic">
        <div class="flex gap-1">
          <span class="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
          <span class="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span class="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
        </div>
        <span>{{ typingUser }} กำลังพิมพ์...</span>
      </div>
    </main>

    <!-- Bottom Chat Input Bar -->
    <footer class="shrink-0 p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/80">
      <div class="max-w-3xl mx-auto">
        <ChatInput
          :disabled="isRoomDestroyed"
          @send="handleSendMessage"
          @typing="handleSendTyping"
        />
      </div>
    </footer>

    <!-- Modals -->
    <UserList
      :show="showUserList"
      :users="userList"
      :currentSocketId="currentSocketId"
      @close="showUserList = false"
    />

    <QRCodeModal
      :show="showQRModal"
      :roomId="roomId"
      @close="showQRModal = false"
    />

    <BurnModal
      :show="showBurnModal"
      :isBurning="isBurning"
      @close="showBurnModal = false"
      @confirm="handleConfirmBurn"
    />

    <!-- Room Destroyed / Expired Fullscreen State -->
    <div
      v-if="isRoomDestroyed"
      class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-lg"
    >
      <div class="max-w-md w-full text-center space-y-6">
        <div class="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-4xl shadow-2xl">
          {{ destructionReason === 'room_burned' ? '🔥' : '💨' }}
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-black text-slate-100">
            {{ destructionReason === 'room_burned' ? 'ห้องถูกทำลายแล้ว' : 'ห้องสลายตัวแล้ว' }}
          </h2>
          <p class="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            {{ destructionMessage || 'ห้องนี้และข้อความทั้งหมดใน RAM ถูกลบอย่างสมบูรณ์ ไม่มีประวัติการสนทนาหลงเหลือ' }}
          </p>
        </div>

        <div class="pt-4">
          <router-link
            to="/"
            class="inline-flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-2xl shadow-xl transition-all"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>กลับสู่หน้าหลัก</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Flame, Users, QrCode, LogOut, ShieldAlert, ArrowLeft, Dices
} from 'lucide-vue-next';
import { wsService } from '../services/websocket.js';
import { generateRandomNickname } from '../services/nickname.js';
import RoomTimer from '../components/RoomTimer.vue';
import ChatMessage from '../components/ChatMessage.vue';
import ChatInput from '../components/ChatInput.vue';
import UserList from '../components/UserList.vue';
import QRCodeModal from '../components/QRCodeModal.vue';
import BurnModal from '../components/BurnModal.vue';

const route = useRoute();
const router = useRouter();
const roomId = ref(route.params.roomId);

// State
const messages = ref([]);
const userList = ref([]);
const roomInfo = ref(null);
const currentSocketId = ref('');
const typingUser = ref(null);
let typingTimeout = null;

const needsNicknamePrompt = ref(false);
const promptNickname = ref('');
const joinError = ref('');

const showUserList = ref(false);
const showQRModal = ref(false);
const showBurnModal = ref(false);
const isBurning = ref(false);

const isRoomDestroyed = ref(false);
const destructionReason = ref('');
const destructionMessage = ref('');

const messagesContainer = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const setupSocketListeners = (socket) => {
  currentSocketId.value = socket.id;

  // New incoming message
  socket.on('new_message', (msg) => {
    messages.value.push(msg);
    scrollToBottom();
  });

  // User joined
  socket.on('user_joined', (data) => {
    userList.value = data.users || [];
    messages.value.push({
      id: 'sys_' + Date.now(),
      isSystem: true,
      text: `${data.user.nickname} เข้าร่วมห้องแล้ว`
    });
    scrollToBottom();
  });

  // User left
  socket.on('user_left', (data) => {
    userList.value = data.users || [];
    if (data.user) {
      messages.value.push({
        id: 'sys_' + Date.now(),
        isSystem: true,
        text: `${data.user.nickname} ออกจากห้องแล้ว`
      });
      scrollToBottom();
    }
  });

  // Typing event
  socket.on('user_typing', (data) => {
    if (data.isTyping) {
      typingUser.value = data.nickname;
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        typingUser.value = null;
      }, 3000);
    } else {
      typingUser.value = null;
    }
  });

  // Room burned / destroyed event
  socket.on('room_destroyed', (data) => {
    isRoomDestroyed.value = true;
    destructionReason.value = data.reason;
    destructionMessage.value = data.message;
    // Wipe local memory messages immediately
    messages.value = [];
    userList.value = [];
    wsService.disconnect();
  });
};

const joinCurrentRoom = async (nicknameToUse) => {
  const socket = wsService.connect();
  setupSocketListeners(socket);

  const ownerToken = sessionStorage.getItem(`ownerToken_${roomId.value}`);

  const res = await wsService.joinRoom({
    roomId: roomId.value,
    nickname: nicknameToUse,
    ownerToken
  });

  if (res && res.success) {
    roomInfo.value = res;
    userList.value = res.users || [];
    if (res.recentMessages && res.recentMessages.length > 0) {
      messages.value = [...res.recentMessages];
    }
    scrollToBottom();
  } else {
    joinError.value = res?.error || 'เกิดข้อผิดพลาดในการเข้าร่วมห้อง';
    isRoomDestroyed.value = true;
    destructionReason.value = 'error';
    destructionMessage.value = res?.error || 'ไม่พบห้องนี้ หรือห้องอาจหมดอายุ/ถูกทำลายไปแล้ว';
  }
};

const submitPromptNickname = () => {
  const nick = promptNickname.value.trim() || generateRandomNickname();
  sessionStorage.setItem('preferred_nickname', nick);
  needsNicknamePrompt.value = false;
  joinCurrentRoom(nick);
};

onMounted(() => {
  const preferred = sessionStorage.getItem('preferred_nickname');
  if (preferred) {
    joinCurrentRoom(preferred);
  } else {
    promptNickname.value = generateRandomNickname();
    needsNicknamePrompt.value = true;
  }
});

onUnmounted(() => {
  wsService.leaveRoom();
  messages.value = [];
});

const handleSendMessage = async (text) => {
  if (isRoomDestroyed.value) return;
  const res = await wsService.sendMessage({
    roomId: roomId.value,
    text
  });
  if (res && !res.success) {
    alert(res.error || 'ส่งข้อความไม่สำเร็จ');
  }
};

const handleSendTyping = (isTyping) => {
  wsService.sendTyping({
    roomId: roomId.value,
    isTyping
  });
};

const handleConfirmBurn = async () => {
  isBurning.value = true;
  const ownerToken = sessionStorage.getItem(`ownerToken_${roomId.value}`);

  const res = await wsService.burnRoom({
    roomId: roomId.value,
    ownerToken
  });

  isBurning.value = false;
  showBurnModal.value = false;

  if (!res?.success) {
    alert(res?.error || 'เฉพาะผู้สร้างห้องเท่านั้นที่สามารถทำลายห้องได้');
  }
};

const handleRoomExpired = () => {
  isRoomDestroyed.value = true;
  destructionReason.value = 'ttl_expired';
  destructionMessage.value = '💨 ห้องนี้หมดอายุตามเวลาที่กำหนดและสลายตัวไปแล้ว';
  messages.value = [];
  userList.value = [];
};

const handleExit = async () => {
  await wsService.leaveRoom();
  wsService.disconnect();
  messages.value = [];
  router.push('/');
};
</script>
