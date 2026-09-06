<template>
  <div class="min-h-screen flex flex-col justify-between p-6 max-w-lg mx-auto">
    <header class="pt-6 flex items-center justify-between pb-6">
      <router-link to="/" class="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </router-link>
      <h2 class="text-lg font-bold text-slate-100">เข้าร่วมห้องแชท</h2>
      <div class="w-9"></div>
    </header>

    <main class="space-y-5 flex-1 flex flex-col justify-center">
      <!-- QR Code Scanner / Upload Options -->
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="startCamera"
          class="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-2xl transition-colors"
        >
          <Camera class="w-6 h-6 text-rose-400" />
          <span class="text-xs font-semibold text-slate-300">สแกน QR</span>
        </button>
        
        <button
          @click="triggerFileUpload"
          class="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-2xl transition-colors"
        >
          <Upload class="w-6 h-6 text-rose-400" />
          <span class="text-xs font-semibold text-slate-300">อัพโหลด QR</span>
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileUpload"
        class="hidden"
      />

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-slate-800"></div>
        <span class="text-xs text-slate-500">หรือ</span>
        <div class="flex-1 h-px bg-slate-800"></div>
      </div>

      <!-- Room ID / Link Input -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
          รหัสห้อง หรือ ลิงก์คำเชิญ
        </label>
        <div class="relative flex items-center">
          <input
            v-model="roomInput"
            type="text"
            placeholder="เช่น a8F2kL9xPq7Z4mT6 หรือ วางลิงก์"
            class="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-2xl py-3.5 px-4 text-sm text-slate-100 font-mono placeholder-slate-500 outline-none transition-colors"
          />
        </div>
      </div>

      <!-- Nickname Section -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
          ชื่อเล่นของคุณ
        </label>
        <div class="relative flex items-center">
          <input
            v-model="nickname"
            type="text"
            maxlength="30"
            placeholder="กรอกชื่อเล่น หรือกดสุ่มชื่อ"
            class="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-2xl py-3.5 px-4 pr-12 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="button"
            @click="randomizeNickname"
            title="สุ่มชื่อเล่นใหม่"
            class="absolute right-2.5 p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Dices class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="p-3.5 bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs rounded-2xl leading-relaxed flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-400" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="p-3.5 bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs rounded-2xl leading-relaxed flex items-center gap-2">
        <CheckCircle class="w-4 h-4 shrink-0 text-emerald-400" />
        <span>{{ successMessage }}</span>
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
        <span>{{ isSubmitting ? 'กำลังตรวจสอบห้อง...' : 'เข้าสู่ห้องแชท' }}</span>
      </button>
    </footer>

    <!-- Camera Scanner Modal -->
    <div v-if="showCamera" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div class="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 class="font-bold text-slate-100">สแกน QR Code</h3>
          <button @click="stopCamera" class="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="relative aspect-square bg-slate-950">
          <video ref="videoElement" autoplay playsinline class="w-full h-full object-cover"></video>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-64 h-64 border-2 border-rose-500 rounded-2xl"></div>
          </div>
        </div>
        
        <div class="p-4">
          <p class="text-xs text-slate-400 text-center">วาง QR Code ให้อยู่ในกรอบสี่เหลี่ยม</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Dices, LogIn, AlertCircle, Camera, Upload, X, CheckCircle } from 'lucide-vue-next';
import { generateRandomNickname } from '../services/nickname.js';
import { wsService } from '../services/websocket.js';
import { BrowserQRCodeReader } from '@zxing/library';

const router = useRouter();

const roomInput = ref('');
const nickname = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showCamera = ref(false);
const videoElement = ref(null);
const fileInput = ref(null);

let codeReader = null;
let stream = null;

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

onUnmounted(() => {
  stopCamera();
});

const extractRoomId = (input) => {
  const clean = input.trim();
  if (clean.includes('/r/')) {
    const parts = clean.split('/r/');
    return parts[parts.length - 1].split('?')[0].split('#')[0].trim();
  }
  return clean;
};

const startCamera = async () => {
  try {
    errorMessage.value = '';
    successMessage.value = '';
    showCamera.value = true;

    // Wait for next tick to ensure video element is mounted
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!videoElement.value) {
      errorMessage.value = 'ไม่สามารถเปิดกล้องได้';
      showCamera.value = false;
      return;
    }

    codeReader = new BrowserQRCodeReader();
    
    const result = await codeReader.decodeFromVideoDevice(
      undefined,
      videoElement.value,
      (result, error) => {
        if (result) {
          const url = result.getText();
          const roomId = extractRoomId(url);
          if (roomId) {
            roomInput.value = roomId;
            successMessage.value = `สแกนสำเร็จ! ห้อง: ${roomId}`;
            stopCamera();
          }
        }
      }
    );
  } catch (err) {
    console.error('Camera error:', err);
    errorMessage.value = 'ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง';
    showCamera.value = false;
  }
};

const stopCamera = () => {
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  showCamera.value = false;
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    errorMessage.value = '';
    successMessage.value = '';
    isSubmitting.value = true;

    const reader = new BrowserQRCodeReader();
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const result = await reader.decodeFromCanvas(canvas);
    const url = result.getText();
    const roomId = extractRoomId(url);
    
    if (roomId) {
      roomInput.value = roomId;
      successMessage.value = `อ่าน QR Code สำเร็จ! ห้อง: ${roomId}`;
    } else {
      errorMessage.value = 'ไม่พบรหัสห้องใน QR Code นี้';
    }
  } catch (err) {
    console.error('QR decode error:', err);
    errorMessage.value = 'ไม่สามารถอ่าน QR Code จากรูปนี้ได้ กรุณาลองใหม่';
  } finally {
    isSubmitting.value = false;
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const handleJoin = async () => {
  const cleanRoomId = extractRoomId(roomInput.value);
  if (!cleanRoomId) {
    errorMessage.value = 'กรุณาระบุรหัสห้อง หรือวางลิงก์คำเชิญ หรือสแกน QR Code';
    return;
  }

  if (!nickname.value.trim()) {
    errorMessage.value = 'กรุณากรอกชื่อเล่นของคุณ';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const backendUrl = wsService.getBackendUrl();
    const res = await fetch(`${backendUrl}/api/room/${cleanRoomId}`);
    if (!res.ok) {
      errorMessage.value = 'ไม่พบห้องนี้ หรือห้องอาจหมดเวลา/ถูกทำลายไปแล้ว';
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
