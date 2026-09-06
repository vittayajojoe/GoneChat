<template>
  <div class="min-h-screen flex flex-col justify-between p-6 max-w-lg mx-auto">
    <header class="pt-6 flex items-center justify-between pb-6">
      <router-link to="/" class="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </router-link>
      <h2 class="text-lg font-bold text-slate-100">Join Ephemeral Room</h2>
      <div class="w-9"></div>
    </header>

    <main class="space-y-6 flex-1 flex flex-col justify-center">
      <!-- Room ID / Link Input -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Room Code or Link
        </label>
        <div class="relative flex items-center">
          <input
            v-model="roomInput"
            type="text"
            placeholder="e.g. a8F2kL9xPq7Z4mT6 or paste link"
            class="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-2xl py-3.5 px-4 text-sm text-slate-100 font-mono placeholder-slate-500 outline-none transition-colors"
          />
        </div>
      </div>

      <!-- Nickname Section -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Your Nickname
        </label>
        <div class="relative flex items-center">
          <input
            v-model="nickname"
            type="text"
            maxlength="30"
            placeholder="Enter nickname"
            class="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-2xl py-3.5 px-4 pr-12 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="button"
            @click="randomizeNickname"
            title="Generate Random Nickname"
            class="absolute right-2.5 p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Dices class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs rounded-xl">
        {{ errorMessage }}
      </div>
    </main>

    <footer class="pt-6 pb-2">
      <button
        type="button"
        @click="handleJoin"
        :disabled="isSubmitting"
        class="w-full py-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <LogIn class="w-5 h-5" />
        <span>{{ isSubmitting ? 'Checking Room...' : 'Enter Room' }}</span>
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Dices, LogIn } from 'lucide-vue-next';
import { generateRandomNickname } from '../services/nickname.js';

const router = useRouter();

const roomInput = ref('');
const nickname = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const randomizeNickname = () => {
  nickname.value = generateRandomNickname();
};

onMounted(() => {
  const saved = sessionStorage.getItem('preferred_nickname');
  if (saved) {
    nickname.value = saved;
  } else {
    randomizeNickname();
  }
});

const extractRoomId = (input) => {
  const clean = input.trim();
  if (clean.includes('/r/')) {
    const parts = clean.split('/r/');
    return parts[parts.length - 1].split('?')[0].split('#')[0].trim();
  }
  return clean;
};

const handleJoin = async () => {
  const cleanRoomId = extractRoomId(roomInput.value);
  if (!cleanRoomId) {
    errorMessage.value = 'Please enter a Room Code or Link';
    return;
  }

  if (!nickname.value.trim()) {
    errorMessage.value = 'Please enter a nickname';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // Verify room existence via HTTP pre-check
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const res = await fetch(`${backendUrl}/api/room/${cleanRoomId}`);
    if (!res.ok) {
      errorMessage.value = 'Room does not exist or has expired';
      isSubmitting.value = false;
      return;
    }

    sessionStorage.setItem('preferred_nickname', nickname.value.trim());
    router.push(`/r/${cleanRoomId}`);
  } catch (err) {
    // If pre-check fails due to network, still try routing directly
    sessionStorage.setItem('preferred_nickname', nickname.value.trim());
    router.push(`/r/${cleanRoomId}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
