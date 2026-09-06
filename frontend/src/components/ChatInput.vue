<template>
  <form @submit.prevent="handleSubmit" class="relative flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 focus-within:border-slate-700 transition-colors">
    <textarea
      ref="textareaRef"
      v-model="text"
      @keydown="handleKeyDown"
      @input="handleInput"
      rows="1"
      maxlength="2000"
      placeholder="Type a temporary message..."
      class="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 max-h-32 leading-relaxed"
    ></textarea>

    <div class="flex items-center gap-2 shrink-0 pb-0.5">
      <span v-if="text.length > 1500" class="text-[10px] font-mono" :class="text.length > 1900 ? 'text-rose-400' : 'text-slate-500'">
        {{ text.length }}/2000
      </span>

      <button
        type="submit"
        :disabled="!text.trim() || disabled"
        class="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
        :class="text.trim() && !disabled ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm' : 'bg-slate-800 text-slate-500 cursor-not-allowed'"
        title="Send Message"
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
