<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import X from "lucide-svelte/icons/x";
  import Star from "lucide-svelte/icons/star";
  import Check from "lucide-svelte/icons/check";
  import type { Review } from "../types";

  interface Props {
    review: Review;
    onClose: () => void;
    onSave: (updated: Review) => void;
  }

  let { review, onClose, onSave }: Props = $props();

  let rating = $state(review.rating);
  let text = $state(review.text);

  const handleSave = () => {
    if (!rating || !text.trim()) return;
    onSave({ ...review, rating, text: text.trim(), date: Date.now() });
  };
</script>

<div
  transition:fade={{ duration: 150 }}
  class="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
  onclick={onClose}
>
  <div
    transition:fly={{ y: 40, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
  >
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-black text-slate-800">แก้ไขรีวิวของคุณ</h2>
      <button onclick={onClose} class="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center">
        <X class="w-4 h-4 text-slate-600" />
      </button>
    </div>

    <div class="mb-4">
      <label class="text-xs font-bold text-slate-600 mb-2 block">คะแนนความพึงพอใจ</label>
      <div class="flex justify-center gap-2">
        {#each [1, 2, 3, 4, 5] as n}
          <button onclick={() => (rating = n)} class="p-1 active:scale-90 transition">
            <Star class={`w-8 h-8 transition-colors ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 hover:text-amber-200"}`} />
          </button>
        {/each}
      </div>
    </div>

    <div class="mb-4">
      <label class="text-xs font-bold text-slate-600 mb-2 block">ข้อความรีวิว</label>
      <textarea
        bind:value={text}
        rows={4}
        placeholder="เขียนรีวิว..."
        class="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none"
      ></textarea>
    </div>

    <button
      onclick={handleSave}
      disabled={!rating || !text.trim()}
      class="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
    >
      <Check class="w-4 h-4" /> บันทึกรีวิว
    </button>
  </div>
</div>