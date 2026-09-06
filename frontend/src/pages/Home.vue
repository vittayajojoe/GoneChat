<template>
  <div class="min-h-screen flex flex-col justify-between p-6 max-w-xl mx-auto">
    <!-- Header / Brand -->
    <header class="pt-8 pb-4 text-center space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/60 shadow-xl mb-2">
        <Flame class="w-8 h-8 text-rose-500" />
      </div>

      <div class="space-y-1">
        <h1 class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          GoneChat
        </h1>
        <p class="text-rose-400 font-semibold text-base tracking-wide">Chat. Then Gone.</p>
        <p class="text-xs text-slate-400 font-thai">คุยเสร็จ หายไป</p>
      </div>

      <p class="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed pt-2">
        Temporary conversations. No permanent chat history. Messages live only in RAM, then vanish forever.
      </p>
    </header>

    <!-- Main Actions -->
    <main class="space-y-4 py-8">
      <router-link
        to="/create"
        class="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-xl shadow-rose-950/40 flex items-center justify-between transition-all group"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-xl">
            <PlusCircle class="w-5 h-5 text-white" />
          </div>
          <div class="text-left">
            <div class="text-base font-bold">Create Room</div>
            <div class="text-xs text-rose-200">Start an ephemeral room with TTL</div>
          </div>
        </div>
        <ArrowRight class="w-5 h-5 text-rose-200 group-hover:translate-x-1 transition-transform" />
      </router-link>

      <router-link
        to="/join"
        class="w-full py-4 px-6 bg-slate-900/90 hover:bg-slate-850 active:scale-[0.99] border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded-2xl shadow-lg flex items-center justify-between transition-all group"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-slate-800 rounded-xl">
            <LogIn class="w-5 h-5 text-slate-300" />
          </div>
          <div class="text-left">
            <div class="text-base font-bold">Join Room</div>
            <div class="text-xs text-slate-400">Enter a Room Code or Link</div>
          </div>
        </div>
        <ArrowRight class="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </router-link>

      <!-- Trust & Privacy Grid -->
      <div class="grid grid-cols-2 gap-3 pt-4">
        <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-rose-400">
            <Cpu class="w-4 h-4" />
            <span class="text-xs font-bold uppercase tracking-wider">RAM Only</span>
          </div>
          <p class="text-xs text-slate-400 leading-snug">No database. Zero persistent disk storage.</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-amber-400">
            <Clock class="w-4 h-4" />
            <span class="text-xs font-bold uppercase tracking-wider">Auto TTL</span>
          </div>
          <p class="text-xs text-slate-400 leading-snug">Room disappears when timer expires.</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-emerald-400">
            <ShieldCheck class="w-4 h-4" />
            <span class="text-xs font-bold uppercase tracking-wider">No Accounts</span>
          </div>
          <p class="text-xs text-slate-400 leading-snug">No login, email, or passwords required.</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div class="flex items-center gap-2 text-rose-500">
            <Flame class="w-4 h-4" />
            <span class="text-xs font-bold uppercase tracking-wider">Burn Room</span>
          </div>
          <p class="text-xs text-slate-400 leading-snug">Instantly destroy room on demand.</p>
        </div>
      </div>
    </main>

    <!-- Footer Privacy Note -->
    <footer class="pt-6 pb-2 text-center text-xs text-slate-500 space-y-1">
      <p class="text-[11px] text-slate-400">
        🛡️ GoneChat ไม่เก็บประวัติข้อความการสนทนาแบบถาวร
      </p>
      <p class="text-[10px] text-slate-600">
        GoneChat MVP &bull; Chat. Then Gone.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { Flame, PlusCircle, LogIn, ArrowRight, Cpu, Clock, ShieldCheck } from 'lucide-vue-next';
</script>
