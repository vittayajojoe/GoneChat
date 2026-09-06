<template>
  <div class="min-h-screen flex flex-col justify-between p-6 max-w-lg mx-auto">
    <header class="pt-6 flex items-center justify-between pb-6">
      <router-link to="/" class="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </router-link>
      <h2 class="text-lg font-bold text-slate-100">สร้างห้องแชทชั่วคราว</h2>
      <button
        @click="showServerModal = true"
        class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="ตั้งค่าเซิร์ฟเวอร์ Backend"
      >
        <Settings class="w-5 h-5" />
      </button>
    </header>

    <main class="space-y-6 flex-1 flex flex-col justify-center">
      <!-- Nickname Section -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
          ชื่อเล่นของคุณ
        </label>
        <div class="relative flex items-center">
          <input
            v-model="nickname"
            type="text"
            maxlength="30"
            placeholder="กรอกชื่อเล่น หรือกดสุ่มชื่อ"
            class="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-2xl py-3.5 px-4 pr-12 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="button"
            @click="randomizeNickname"
            title="สุ่มชื่อเล่นใหม่"
            class="absolute right-2.5 p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Dices class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- TTL Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
            อายุของห้อง (TTL)
          </label>
          <span class="text-xs text-rose-400 font-medium">ห้องจะสลายตัวอัตโนมัติ</span>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-for="opt in ttlOptions"
            :key="opt.value"
            type="button"
            @click="selectedTTL = opt.value"
            class="p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all"
            :class="selectedTTL === opt.value
              ? 'bg-rose-950/40 border-rose-500 text-white shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'"
          >
            <span class="text-sm font-semibold">{{ opt.label }}</span>
            <div
              class="w-4 h-4 rounded-full border flex items-center justify-center"
              :class="selectedTTL === opt.value ? 'border-rose-500 bg-rose-500' : 'border-slate-700'"
            >
              <div v-if="selectedTTL === opt.value" class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </button>
        </div>
      </div>

      <!-- Error banner with Setup Backend CTA -->
      <div v-if="errorMessage" class="p-4 bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs rounded-2xl leading-relaxed space-y-2">
        <div class="flex items-center gap-2 font-medium">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-400" />
          <span>{{ errorMessage }}</span>
        </div>
        <div v-if="showConfigPrompt" class="pt-1">
          <button
            type="button"
            @click="showServerModal = true"
            class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Settings class="w-3.5 h-3.5" />
            <span>กดตรงนี้เพื่อระบุ Server URL</span>
          </button>
        </div>
      </div>
    </main>

    <footer class="pt-6 pb-2">
      <button
        type="button"
        @click="handleCreate"
        :disabled="isSubmitting"
        class="w-full py-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <Flame class="w-5 h-5" />
        <span>{{ isSubmitting ? 'กำลังสร้างห้อง...' : 'เปิดห้องแชท' }}</span>
      </button>
    </footer>

    <!-- Server Settings Modal -->
    <ServerSettingsModal
      :show="showServerModal"
      @close="showServerModal = false"
      @saved="handleServerSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Dices, Flame, AlertCircle, Settings } from 'lucide-vue-next';
import { generateRandomNickname } from '../services/nickname.js';
import { wsService } from '../services/websocket.js';
import ServerSettingsModal from '../components/ServerSettingsModal.vue';

const router = useRouter();

const nickname = ref('');
const selectedTTL = ref(1800); // 30 mins
const isSubmitting = ref(false);
const errorMessage = ref('');
const showConfigPrompt = ref(false);
const showServerModal = ref(false);

const ttlOptions = [
  { label: '5 นาที', value: 300 },
  { label: '15 นาที', value: 900 },
  { label: '30 นาที', value: 1800 },
  { label: '1 ชั่วโมง', value: 3600 },
  { label: '6 ชั่วโมง', value: 21600 },
  { label: '24 ชั่วโมง', value: 86400 }
];

const randomizeNickname = () => {
  nickname.value = generateRandomNickname();
};

onMounted(() => {
  randomizeNickname();
});

const handleCreate = async () => {
  if (!nickname.value.trim()) {
    errorMessage.value = 'กรุณาระบุชื่อเล่นของคุณ หรือกดสุ่มชื่อ';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  showConfigPrompt.value = false;

  try {
    console.log('[CreateRoom] Creating room...');
    const res = await wsService.createRoomHttp({
      ttl: selectedTTL.value,
      nickname: nickname.value.trim()
    });

    console.log('[CreateRoom] Response:', res);

    if (res && res.success) {
      sessionStorage.setItem(`ownerToken_${res.roomId}`, res.ownerToken);
      sessionStorage.setItem('preferred_nickname', nickname.value.trim());

      console.log('[CreateRoom] Navigating to room:', res.roomId);
      
      // Wait a bit before navigating to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push(`/r/${res.roomId}`);
    } else {
      errorMessage.value = res?.error || 'เกิดข้อผิดพลาดในการสร้างห้อง กรุณาลองใหม่อีกครั้ง';
      if (res?.needsBackendUrl) {
        showConfigPrompt.value = true;
      }
    }
  } catch (err) {
    console.error('[CreateRoom] Error:', err);
    errorMessage.value = 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Backend ได้';
    showConfigPrompt.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

const handleServerSaved = () => {
  errorMessage.value = '';
  showConfigPrompt.value = false;
};
</script>
