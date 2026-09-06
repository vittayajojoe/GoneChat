<template>
  <form @submit.prevent="handleSubmit" class="relative flex items-end gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-2.5 focus-within:border-rose-500/50 transition-colors shadow-lg">
    <!-- Image Preview -->
    <div v-if="selectedImage" class="absolute bottom-full left-0 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-2xl flex items-center gap-2">
      <img :src="selectedImage" class="w-16 h-16 object-cover rounded-lg" />
      <button @click="clearImage" type="button" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Image Upload Button -->
    <button
      type="button"
      @click="triggerImageUpload"
      class="shrink-0 p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
      title="แนบรูปภาพ (จะหายหลังอ่าน 2 ครั้ง)"
    >
      <ImageIcon class="w-5 h-5" />
    </button>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleImageSelect"
      class="hidden"
    />

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
        :disabled="(!text.trim() && !selectedImage) || disabled"
        class="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
        :class="(text.trim() || selectedImage) && !disabled 
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
import { Send, ImageIcon, X } from 'lucide-vue-next';
import imageCompression from 'browser-image-compression';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send', 'typing']);

const text = ref('');
const textareaRef = ref(null);
const fileInput = ref(null);
const selectedImage = ref(null);
const selectedImageData = ref(null);
const isCompressing = ref(false);

let typingTimer = null;
let isCurrentlyTyping = false;

const triggerImageUpload = () => {
  fileInput.value?.click();
};

const handleImageSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    isCompressing.value = true;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage.value = e.target.result;
    };
    reader.readAsDataURL(file);

    // Compress image
    const options = {
      maxSizeMB: 0.5,              // Max 500KB
      maxWidthOrHeight: 1920,      // Max dimension
      useWebWorker: true,
      fileType: file.type,
      initialQuality: 0.8          // Good quality
    };

    const compressedFile = await imageCompression(file, options);
    console.log('[ImageCompress] Original:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('[ImageCompress] Compressed:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

    // Convert compressed file to base64
    const compressedReader = new FileReader();
    compressedReader.onload = (e) => {
      selectedImageData.value = e.target.result;
      selectedImage.value = e.target.result; // Update preview with compressed version
    };
    compressedReader.readAsDataURL(compressedFile);

  } catch (err) {
    console.error('Image compression error:', err);
    alert('ไม่สามารถบีบอัดรูปภาพได้ กรุณาลองอีกครั้ง');
    clearImage();
  } finally {
    isCompressing.value = false;
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const clearImage = () => {
  selectedImage.value = null;
  selectedImageData.value = null;
};

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
  if (isCompressing.value) {
    alert('กำลังบีบอัดรูปภาพ กรุณารอสักครู่...');
    return;
  }

  const content = text.value.trim();
  const hasImage = !!selectedImageData.value;
  
  if (!content && !hasImage) return;
  if (props.disabled) return;

  emit('send', { text: content, image: selectedImageData.value });
  text.value = '';
  clearImage();

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
