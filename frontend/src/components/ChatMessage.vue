<template>
  <!-- System / Event notice -->
  <div v-if="message.isSystem" class="flex justify-center my-2">
    <div class="px-3 py-1 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs rounded-full max-w-sm text-center">
      {{ message.text }}
    </div>
  </div>

  <!-- Outgoing Message (Me) -->
  <div v-else-if="isMe" class="flex flex-col items-end mb-3 select-text">
    <div class="flex items-center gap-1.5 mb-1 px-1">
      <span class="text-[11px] text-slate-400">You</span>
      <span class="text-[10px] text-slate-500 font-mono">{{ formatTime(message.timestamp) }}</span>
    </div>
    <div class="bg-rose-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] md:max-w-md break-words shadow-sm">
      <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.text }}</p>
    </div>
  </div>

  <!-- Incoming Message (Others) -->
  <div v-else class="flex flex-col items-start mb-3 select-text">
    <div class="flex items-center gap-1.5 mb-1 px-1">
      <span class="text-[11px] font-medium text-emerald-400">{{ message.senderName }}</span>
      <span class="text-[10px] text-slate-500 font-mono">{{ formatTime(message.timestamp) }}</span>
    </div>
    <div class="bg-slate-800 border border-slate-700/60 text-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] md:max-w-md break-words shadow-sm">
      <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.text }}</p>
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
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
