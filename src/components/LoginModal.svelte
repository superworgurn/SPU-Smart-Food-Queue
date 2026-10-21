<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import LockKeyhole from "lucide-svelte/icons/lock-keyhole";
  import Loader2 from "lucide-svelte/icons/loader-2";
  import LogIn from "lucide-svelte/icons/log-in";

  interface Props {
    loading: boolean;
    onClose: () => void;
    onLogin: (method: string) => void;
  }

  let { loading, onClose, onLogin }: Props = $props();
</script>

<div
  transition:fade={{ duration: 150 }}
  class="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
  onclick={onClose}
  role="presentation"
>
  <div
    transition:fly={{ y: 80, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="flex flex-col items-center">
      <div class="h-14 w-14 rounded-2xl bg-emerald-100 grid place-items-center mb-3">
        <LockKeyhole class="w-7 h-7 text-emerald-600" />
      </div>
      <h2 class="text-lg font-black text-slate-800">เข้าสู่ระบบนักศึกษา</h2>
      <p class="text-xs text-slate-500 mt-1 mb-5 text-center leading-relaxed">เข้าสู่ระบบเพื่อสั่งจองคิวอาหาร<br/>และติดตามสถานะออเดอร์ของคุณ</p>

      <form onsubmit={(e) => { e.preventDefault(); onLogin("email"); }} class="w-full space-y-3">
        <div>
          <label for="student-id" class="text-xs font-bold text-slate-600">รหัสนักศึกษา / อีเมล</label>
          <input id="student-id" required type="text" placeholder="เช่น 66012345 หรือ student@spu.ac.th" class="mt-1 w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
        </div>
        <div>
          <label for="password" class="text-xs font-bold text-slate-600">รหัสผ่าน</label>
          <input id="password" required type="password" placeholder="••••••••" class="mt-1 w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
        </div>

        <button type="submit" disabled={loading} class="mt-2 w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition">
          {#if loading}
            <Loader2 class="w-4 h-4 animate-spin" /> กำลังเข้าสู่ระบบ...
          {:else}
            <LogIn class="w-4 h-4" /> เข้าสู่ระบบด้วยอีเมล
          {/if}
        </button>
      </form>

       <div class="mt-4 flex items-center w-full gap-2">
        <div class="h-px bg-slate-200 flex-1"></div>
        <span class="text-[10px] font-semibold text-slate-400 uppercase">หรือ</span>
        <div class="h-px bg-slate-200 flex-1"></div>
      </div> 

      <div class="w-full grid grid-cols-2 gap-2 mt-4">
        <button type="button" onclick={() => onLogin("Google")} disabled={loading} class="h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm">
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button type="button" onclick={() => onLogin("Facebook")} disabled={loading} class="h-11 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      <button onclick={onClose} class="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition">
        เข้าชมแบบผู้เยี่ยมชม (Guest)
      </button>
    </div>
  </div>
</div>