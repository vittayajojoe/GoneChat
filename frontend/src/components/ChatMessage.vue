<template>
  <!-- System / Event notice -->
  <div v-if="message.isSystem" class="flex justify-center my-2">
    <div class="px-3 py-1 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs rounded-full max-w-sm text-center">
      {{ message.text }}
    </div>
  </div>

  <!-- Outgoing Message (Me) -->
  <div v-else-if="isMe" class="flex flex-col items-end mb-2 px-2 select-text w-full">
    <div class="flex items-center gap-1.5 mb-1">
      <span class="text-[10px] text-slate-500 font-mono">{{ formatTime(message.timestamp) }}</span>
      <span class="text-[11px] font-semibold text-rose-400">คุณ</span>
    </div>
    <div class="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-[85%] break-words shadow-lg">
      <!-- Image (if present) -->
      <div v-if="message.image" class="mb-2">
        <div v-if="message.image.data" class="relative">
          <img v-if="imageShown" :src="message.image.data" class="max-w-full max-h-64 h-auto rounded-lg object-contain" />
          <button v-else @click="showImage" class="flex items-center gap-2 px-2.5 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
            <Eye class="w-4 h-4" />
            <span class="text-xs">คลิกเพื่อดูรูป ({{ message.image.viewCount || 0 }}/{{ message.image.maxViews }})</span>
          </button>
        </div>
        <div v-else class="text-xs text-white/60 italic">รูปภาพหายไปแล้ว</div>
      </div>
      <p v-if="message.text" class="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{{ message.text }}</p>
    </div>
  </div>

  <!-- Incoming Message (Others) -->
  <div v-else class="flex flex-col items-start mb-2 px-2 select-text w-full">
    <div class="flex items-center gap-1.5 mb-1">
      <span class="text-[11px] font-semibold text-emerald-400 truncate max-w-[150px]">{{ message.senderName || message.nickname || 'Unknown' }}</span>
      <span class="text-[10px] text-slate-500 font-mono">{{ formatTime(message.timestamp) }}</span>
    </div>
    <div class="bg-slate-800 border border-slate-700/60 text-slate-100 rounded-2xl rounded-tl-md px-3 py-2 max-w-[85%] break-words shadow-md">
      <!-- Image (if present) -->
      <div v-if="message.image" class="mb-2">
        <div v-if="message.image.data" class="relative">
          <img v-if="imageShown" :src="message.image.data" class="max-w-full max-h-64 h-auto rounded-lg object-contain" />
          <button v-else @click="showImage" class="flex items-center gap-2 px-2.5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm">
            <Eye class="w-4 h-4" />
            <span class="text-xs">คลิกเพื่อดูรูป ({{ message.image.viewCount || 0 }}/{{ message.image.maxViews }})</span>
          </button>
        </div>
        <div v-else class="text-xs text-slate-400 italic">รูปภาพหายไปแล้ว</div>
      </div>
      <p v-if="message.text && message.text !== '📷 รูปภาพ'" class="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{{ message.text }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Eye } from 'lucide-vue-next';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  currentSocketId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['viewImage']);

const isMe = props.message.senderId === props.currentSocketId;
const imageShown = ref(false);

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
};

const showImage = () => {
  imageShown.value = true;
  if (!isMe && props.message.image?.data) {
    emit('viewImage', props.message.id);
  }
};
</script>
