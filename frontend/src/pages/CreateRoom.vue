<template>
  <div class="min-h-screen flex flex-col justify-between p-6 max-w-lg mx-auto">
    <header class="pt-6 flex items-center justify-between pb-6">
      <router-link to="/" class="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </router-link>
      <h2 class="text-lg font-bold text-slate-100">Create Ephemeral Room</h2>
      <div class="w-9"></div>
    </header>

    <main class="space-y-6 flex-1 flex flex-col justify-center">
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

      <!-- TTL Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Room Lifetime (TTL)
          </label>
          <span class="text-xs text-rose-400 font-medium">Room auto-burns after TTL</span>
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

      <!-- Error banner -->
      <div v-if="errorMessage" class="p-3 bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs rounded-xl">
        {{ errorMessage }}
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
        <span>{{ isSubmitting ? 'Creating Room...' : 'Launch Room' }}</span>
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Dices, Flame } from 'lucide-vue-next';
import { generateRandomNickname } from '../services/nickname.js';
import { wsService } from '../services/websocket.js';

const router = useRouter();

const nickname = ref('');
const selectedTTL = ref(1800); // 30 mins
const isSubmitting = ref(false);
const errorMessage = ref('');

const ttlOptions = [
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '24 hours', value: 86400 }
];

const randomizeNickname = () => {
  nickname.value = generateRandomNickname();
};

onMounted(() => {
  randomizeNickname();
});

const handleCreate = async () => {
  if (!nickname.value.trim()) {
    errorMessage.value = 'Please enter or generate a nickname';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const res = await wsService.createRoom({
      ttl: selectedTTL.value,
      nickname: nickname.value.trim()
    });

    if (res && res.success) {
      // Temporarily store ownerToken and nickname in memory / sessionStorage for this session
      sessionStorage.setItem(`ownerToken_${res.roomId}`, res.ownerToken);
      sessionStorage.setItem('preferred_nickname', nickname.value.trim());

      router.push(`/r/${res.roomId}`);
    } else {
      errorMessage.value = res?.error || 'Failed to create room. Please try again.';
    }
  } catch (err) {
    errorMessage.value = 'Network or connection error. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
