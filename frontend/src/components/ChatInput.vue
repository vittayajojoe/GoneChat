<template>
  <form @submit.prevent="handleSubmit" class="relative flex items-end gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 focus-within:border-rose-500/50 transition-colors shadow-lg">
    <textarea
      ref="textareaRef"
      v-model="text"
      @keydown="handleKeyDown"
      @input="handleInput"
      rows="1"
      maxlength="2000"
      placeholder="พิมพ์ข้อความ... (Enter=ส่ง, Shift+Enter=บรรทัดใหม่)"
      class="w-full bg-transparent text-[15px] text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2 py-1.5 max-h-32 leading-relaxed"
      :disabled="disabled"
    ></textarea>

    <div class="flex items-center gap-2 shrink-0 pb-1">
      <span v-if="text.length > 1500" class="text-[10px] font-mono" :class="text.length > 1900 ? 'text-rose-400' : 'text-slate-400'">
        {{ text.length }}/2000
      </span>

      <button
        type="submit"
        :disabled="!text.trim() || disabled"
        class="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
        :class="text.trim() && !disabled 
          ? 'bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg' 
          : 'bg-slate-700 text-slate-500 cursor-not-allowed'"
        title="ส่งข้อความ (Enter)"
      >
        <Send class="w-4 h-4" />
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { Send } from 'lucide-vue-next';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send', 'typing']);

const text = ref('');
const textareaRef = ref(null);
let typingTimer = null;
let isCurrentlyTyping = false;

const handleInput = () => {
  adjustHeight();

  // Handle typing debounce
  if (!isCurrentlyTyping) {
    isCurrentlyTyping = true;
    emit('typing', true);
  }

  if (typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isCurrentlyTyping = false;
    emit('typing', false);
  }, 1500);
};

const adjustHeight = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};

const handleSubmit = () => {
  const content = text.value.trim();
  if (!content || props.disabled) return;

  emit('send', content);
  text.value = '';

  if (isCurrentlyTyping) {
    isCurrentlyTyping = false;
    if (typingTimer) clearTimeout(typingTimer);
    emit('typing', false);
  }

  nextTick(() => {
    adjustHeight();
  });
};
</script>
