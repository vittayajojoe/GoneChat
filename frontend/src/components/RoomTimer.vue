<template>
  <div
    class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors"
    :class="timerClass"
    :title="`Room expires at ${new Date(expiresAt).toLocaleTimeString()}`"
  >
    <Clock class="w-3.5 h-3.5" :class="{ 'animate-pulse text-rose-400': isCritical }" />
    <span>{{ formattedTime }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Clock } from 'lucide-vue-next';

const props = defineProps({
  expiresAt: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['expired']);

const remainingSeconds = ref(0);
let intervalId = null;

const updateTime = () => {
  const diff = Math.max(0, Math.floor((props.expiresAt - Date.now()) / 1000));
  remainingSeconds.value = diff;

  if (diff <= 0) {
    if (intervalId) clearInterval(intervalId);
    emit('expired');
  }
};

onMounted(() => {
  updateTime();
  intervalId = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

watch(() => props.expiresAt, () => {
  updateTime();
});

const isWarning = computed(() => remainingSeconds.value <= 300 && remainingSeconds.value > 60);
const isCritical = computed(() => remainingSeconds.value <= 60);

const timerClass = computed(() => {
  if (isCritical.value) {
    return 'bg-rose-950/70 border border-rose-600/50 text-rose-300 animate-pulse';
  }
  if (isWarning.value) {
    return 'bg-amber-950/60 border border-amber-600/40 text-amber-300';
  }
  return 'bg-slate-800/80 border border-slate-700/60 text-emerald-400';
});

const formattedTime = computed(() => {
  const secs = remainingSeconds.value;
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
});
</script>
