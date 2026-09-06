<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" @click.self="emit('close')">
    <div class="w-full max-w-sm bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl space-y-5 text-center burn-glow">
      <div class="w-14 h-14 bg-rose-950/80 border border-rose-600/40 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-lg">
        <Flame class="w-8 h-8 animate-bounce" />
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-bold text-rose-100">Burn Room?</h3>
        <p class="text-sm text-slate-300 leading-relaxed">
          Are you sure? All participants will be disconnected and all messages in RAM will be destroyed immediately.
        </p>
        <p class="text-xs text-rose-400 font-medium">This action cannot be undone.</p>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          @click="emit('close')"
          :disabled="isBurning"
          class="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-medium rounded-xl transition-colors"
        >
          Cancel
        </button>

        <button
          @click="emit('confirm')"
          :disabled="isBurning"
          class="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-rose-950 flex items-center justify-center gap-2"
        >
          <Flame class="w-4 h-4" />
          <span>{{ isBurning ? 'Burning...' : 'Burn Room' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Flame } from 'lucide-vue-next';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isBurning: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'confirm']);
</script>
