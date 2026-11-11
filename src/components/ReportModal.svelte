<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import X from "lucide-svelte/icons/x";
  import Flag from "lucide-svelte/icons/flag";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";
  import Send from "lucide-svelte/icons/send";
  import type { Review } from "../types";

  interface Props {
    review: Review;
    onClose: () => void;
    onSubmit: (reason: string, details: string) => void;
  }

  let { review, onClose, onSubmit }: Props = $props();

  let selectedReason = $state("");
  let details = $state("");
  let submitting = $state(false);

  const REASONS = [
    { id: "spam", label: "สแปม / โฆษณา", icon: "🚫" },
    { id: "harassment", label: "ก่อกวน / กลั่นแกล้ง", icon: "😡" },
    { id: "hate", label: "ข้อความเกลียดชัง / เหยียด", icon: "⚠️" },
    { id: "inappropriate", label: "เนื้อหาไม่เหมาะสม", icon: "🔞" },
    { id: "fake", label: "รีวิวปลอม / ข้อมูลเท็จ", icon: "🎭" },
    { id: "other", label: "อื่น ๆ", icon: "📝" },
  ];

  const handleSubmit = () => {
    if (!selectedReason) return;
    submitting = true;
    setTimeout(() => {
      onSubmit(selectedReason, details);
      submitting = false;
    }, 800);
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
  aria-label="รายงานรีวิวไม่เหมาะสม"
  tabindex="-1"
>
  <div
    transition:fly={{ y: 40, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    class="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
    role="document"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="h-9 w-9 rounded-xl bg-red-100 grid place-items-center">
          <Flag class="w-4 h-4 text-red-600" />
        </div>
        <h2 class="text-base font-black text-slate-800">รายงานรีวิว</h2>
      </div>
      <button
        onclick={onClose}
        class="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center"
        aria-label="ปิด"
      >
        <X class="w-4 h-4 text-slate-600" />
      </button>
    </div>

    <!-- Review Preview -->
    <div class="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-3">
      <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">รีวิวที่ถูกรายงาน</p>
      <p class="text-xs text-slate-700 line-clamp-2">"{review.text}"</p>
      <p class="text-[10px] text-slate-400 mt-1">โดย: {review.userName}</p>
    </div>

    <!-- Reason Selection -->
    <div class="mb-4">
      <label class="text-xs font-bold text-slate-600 mb-2 block">
        เลือกเหตุผลที่รีวิวนี้ไม่เหมาะสม *
      </label>
      <div class="space-y-1.5">
        {#each REASONS as r}
          <button
            onclick={() => (selectedReason = r.id)}
            class={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
              selectedReason === r.id
                ? "bg-red-50 border-red-400 text-red-700"
                : "bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-red-50/50"
            }`}
          >
            <span class="text-base">{r.icon}</span>
            <span>{r.label}</span>
            {#if selectedReason === r.id}
              <span class="ml-auto text-red-500">✓</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Details -->
    <div class="mb-4">
      <label for="report-details" class="text-xs font-bold text-slate-600 mb-2 block">
        รายละเอียดเพิ่มเติม (ไม่บังคับ)
      </label>
      <textarea
        id="report-details"
        bind:value={details}
        rows={3}
        placeholder="อธิบายเพิ่มเติมว่ารีวิวนี้มีปัญหาอย่างไร..."
        class="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-red-400/50 resize-none"
      ></textarea>
    </div>

    <!-- Warning -->
    <div class="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
      <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p class="text-[11px] text-amber-800 leading-relaxed">
        การรายงานเท็จหรือรายงานก่อกวนอาจมีผลต่อการใช้งานของคุณ โปรดใช้วิจารณญาณก่อนรายงาน
      </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        onclick={onClose}
        class="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
      >
        ยกเลิก
      </button>
      <button
        onclick={handleSubmit}
        disabled={!selectedReason || submitting}
        class="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if submitting}
          <span class="animate-pulse">กำลังส่ง...</span>
        {:else}
          <Send class="w-3.5 h-3.5" /> ส่งรายงาน
        {/if}
      </button>
    </div>
  </div>
</div>