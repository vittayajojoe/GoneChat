<template>
  <!-- System / Event notice -->
  <div v-if="message.isSystem" class="flex justify-center my-2">
    <div class="px-3 py-1 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs rounded-full max-w-sm text-center">
      {{ message.text }}
    </div>
  </div>

  <!-- Outgoing Message (Me) -->
  <div v-else-if="isMe" class="flex flex-col items-end mb-2 px-2 select-text">
    <div class="flex items-center gap-1.5 mb-1">
      <span class="text-[10px] text-slate-500 font-mono">{{ formatTime(message.timestamp) }}</span>
      <span class="text-[11px] font-semibold text-rose-400">คุณ</span>
    </div>
    <div class="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%] break-words shadow-lg">
      <p class="text-[15px] leading-relaxed whitespace-pre-wrap">{{ message.text }}</p>
    </div>
  </div>

  <!-- Incoming Message (Others) -->
  <div v-else class="flex flex-col items-start mb-2 px-2 select-text">
    <div class="flex items-center gap-1.5 mb-1">
      <span class="text-[11px] font-semibold text-emerald-400">{{ message.nickname || 'Unknown' }}</span>
      <span class="text-[10px] text-slate-500 font-mono">{{ formatTime(message.timestamp) }}</span>
    </div>
    <div class="bg-slate-800 border border-slate-700/60 text-slate-100 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%] break-words shadow-md">
      <p class="text-[15px] leading-relaxed whitespace-pre-wrap">{{ message.text }}</p>
    </div>
  </div>
</template>

<script setup>
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

const isMe = props.message.senderId === props.currentSocketId;

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
};
</script>
