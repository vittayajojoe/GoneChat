<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" @click.self="emit('close')">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
      <div class="flex items-center justify-between pb-1 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <Server class="w-5 h-5 text-rose-500" />
          <h3 class="text-base font-bold text-slate-100">ตั้งค่าเซิร์ฟเวอร์ Backend</h3>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-3">
        <p class="text-xs text-slate-300 leading-relaxed">
          หน้าเว็บนี้ทำงานบน Cloudflare สำหรับระบบแชท RAM-only จำเป็นต้องระบุที่อยู่ของ <span class="text-rose-400 font-semibold">Node.js WebSocket Server</span>:
        </p>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Backend Server URL
          </label>
          <input
            v-model="serverUrl"
            type="text"
            placeholder="เช่น https://gonechat-server.onrender.com หรือ https://xxxx.trycloudflare.com"
            class="w-full bg-slate-800 border border-slate-700 focus:border-rose-500 rounded-xl py-3 px-4 text-xs font-mono text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        <div class="flex items-center gap-2 pt-1">
          <button
            type="button"
            @click="testConnection"
            :disabled="isTesting"
            class="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Activity class="w-3.5 h-3.5 text-emerald-400" />
            <span>{{ isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ' }}</span>
          </button>

          <span v-if="testResult" class="text-xs" :class="testResult.success ? 'text-emerald-400' : 'text-rose-400'">
            {{ testResult.message }}
          </span>
        </div>
      </div>

      <div class="pt-2 flex items-center gap-2">
        <button
          @click="emit('close')"
          class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-medium rounded-xl transition-colors"
        >
          ยกเลิก
        </button>
        <button
          @click="saveServerUrl"
          class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
        >
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Server, X, Activity } from 'lucide-vue-next';
import { wsService } from '../services/websocket.js';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'saved']);

const serverUrl = ref('');
const isTesting = ref(false);
const testResult = ref(null);

onMounted(() => {
  serverUrl.value = wsService.getBackendUrl();
});

const testConnection = async () => {
  const cleanUrl = serverUrl.value.trim().replace(/\/+$/, '');
  isTesting.value = true;
  testResult.value = null;

  try {
    const res = await fetch(`${cleanUrl}/health`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      testResult.value = { success: true, message: '✓ เชื่อมต่อเซิร์ฟเวอร์สำเร็จ!' };
    } else {
      testResult.value = { success: false, message: `✕ เซิร์ฟเวอร์ตอบกลับ HTTP ${res.status}` };
    }
  } catch (err) {
    testResult.value = { success: false, message: '✕ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' };
  } finally {
    isTesting.value = false;
  }
};

const saveServerUrl = () => {
  wsService.setBackendUrl(serverUrl.value);
  emit('saved', serverUrl.value);
  emit('close');
};
</script>
