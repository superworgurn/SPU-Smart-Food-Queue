<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import X from "lucide-svelte/icons/x";
  import Star from "lucide-svelte/icons/star";
  import Send from "lucide-svelte/icons/send";
  import StoreIcon from "lucide-svelte/icons/store";

  interface Props {
    orderSummary: string;
    storeName: string;
    storeEmoji: string;
    onClose: () => void;
    onSubmit: (rating: number, text: string) => void;
  }

  let { orderSummary, storeName, storeEmoji, onClose, onSubmit }: Props = $props();

  let rating = $state(0);
  let text = $state("");

  const handleSubmit = () => {
    if (!rating) return;
    onSubmit(rating, text.trim() || "ผู้ใช้ให้คะแนนโดยไม่มีความเห็นเพิ่มเติม");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
</script>

<div
  transition:fade={{ duration: 150 }}
  class="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
  onclick={onClose}
  onkeydown={handleKeyDown}
  role="dialog"
  aria-modal="true"
  aria-label="เขียนรีวิว"
  tabindex="-1"
>
  <div
    transition:fly={{ y: 40, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
    role="document"
  >
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-black text-slate-800">เขียนรีวิว</h2>
      <button
        onclick={onClose}
        class="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center"
        aria-label="ปิด"
      >
        <X class="w-4 h-4 text-slate-600" />
      </button>
    </div>

    <div class="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-3">
      <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1.5">
        <StoreIcon class="w-2.5 h-2.5" /> {storeEmoji} {storeName}
      </span>
      <p class="text-[11px] text-slate-600 leading-snug">{orderSummary}</p>
    </div>

    <div class="mb-4">
      <label class="text-xs font-bold text-slate-600 mb-2 block">คะแนนความพึงพอใจ *</label>
      <div class="flex justify-center gap-2" role="radiogroup" aria-label="เลือกคะแนน">
        {#each [1, 2, 3, 4, 5] as n}
          <button
            onclick={() => (rating = n)}
            class="p-1 active:scale-90 transition"
            role="radio"
            aria-checked={n <= rating}
            aria-label={`${n} ดาว`}
          >
            <Star class={`w-9 h-9 transition-colors ${n <= rating ? "text-amber-400 fill-amber-400 drop-shadow" : "text-slate-200 hover:text-amber-200"}`} />
          </button>
        {/each}
      </div>
    </div>

    <div class="mb-4">
      <label for="history-review-text" class="text-xs font-bold text-slate-600 mb-2 block">ข้อความรีวิว</label>
      <textarea
        id="history-review-text"
        bind:value={text}
        rows={3}
        placeholder="บอกเล่าประสบการณ์ของคุณ เช่น รสชาติ ความเร็ว การบริการ..."
        class="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none"
      ></textarea>
    </div>

    <button
      onclick={handleSubmit}
      disabled={!rating}
      class="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Send class="w-4 h-4" /> ส่งรีวิว
    </button>
  </div>
</div>