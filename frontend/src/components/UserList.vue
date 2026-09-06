<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="emit('close')">
    <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <Users class="w-5 h-5 text-emerald-400" />
          <h3 class="text-base font-semibold text-slate-100">ผู้เข้าร่วมในห้อง ({{ users.length }} คน)</h3>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="max-h-64 overflow-y-auto space-y-2 pr-1">
        <div
          v-for="u in users"
          :key="u.socketId"
          class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></div>
            <span class="text-sm font-medium text-slate-200">
              {{ u.nickname }}
              <span v-if="u.socketId === currentSocketId" class="text-xs text-rose-400 font-normal"> (คุณ)</span>
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <span
              v-if="u.isHost"
              class="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-amber-950/80 text-amber-400 border border-amber-800/60"
            >
              หัวหน้าห้อง
            </span>
          </div>
        </div>
      </div>

      <button
        @click="emit('close')"
        class="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-medium rounded-xl transition-colors"
      >
        ปิด
      </button>
    </div>
  </div>
</template>

<script setup>
import { Users, X } from 'lucide-vue-next';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  },
  currentSocketId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);
</script>
