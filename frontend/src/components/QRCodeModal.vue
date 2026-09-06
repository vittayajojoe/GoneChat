<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" @click.self="emit('close')">
    <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
      <div class="flex items-center justify-between pb-1">
        <h3 class="text-base font-semibold text-slate-100 flex items-center gap-2">
          <QrCode class="w-5 h-5 text-rose-400" />
          แชร์ห้องแชท
        </h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex justify-center p-4 bg-white rounded-2xl shadow-inner mx-auto w-fit">
        <canvas ref="canvasRef" class="w-48 h-48"></canvas>
      </div>

      <div class="space-y-1">
        <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">รหัสห้อง (Room Code)</p>
        <p class="text-sm font-mono font-bold text-slate-200 select-all bg-slate-800/80 py-1.5 px-3 rounded-lg border border-slate-700/50 inline-block">
          {{ roomId }}
        </p>
      </div>

      <div class="flex flex-col gap-2 pt-2">
        <button
          @click="handleCopy"
          class="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Check v-if="copied" class="w-4 h-4 text-white" />
          <Copy v-else class="w-4 h-4" />
          <span>{{ copied ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอกลิงก์เชิญเข้าห้อง' }}</span>
        </button>

        <button
          v-if="canShare"
          @click="handleNativeShare"
          class="w-full py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Share2 class="w-4 h-4" />
          <span>แชร์ผ่านแอปอื่น...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import QRCode from 'qrcode';
import { QrCode, X, Copy, Check, Share2 } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const canvasRef = ref(null);
const copied = ref(false);

const roomUrl = computed(() => {
  return `${window.location.origin}/r/${props.roomId}`;
});

const canShare = computed(() => {
  return typeof navigator !== 'undefined' && !!navigator.share;
});

const generateQR = async () => {
  if (!props.show) return;
  await nextTick();
  if (canvasRef.value) {
    QRCode.toCanvas(canvasRef.value, roomUrl.value, {
      width: 192,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    generateQR();
  }
});

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(roomUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

const handleNativeShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'คำเชิญเข้าร่วม GoneChat',
        text: 'เข้าร่วมห้องแชทชั่วคราวกับฉันบน GoneChat (ไม่มีประวัติการสนทนา)',
        url: roomUrl.value
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed', err);
    }
  }
};
</script>
