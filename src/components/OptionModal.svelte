<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import X from "lucide-svelte/icons/x";
  import Flame from "lucide-svelte/icons/flame";
  import Coffee from "lucide-svelte/icons/coffee";
  import PenLine from "lucide-svelte/icons/pen-line";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import type { MenuItem } from "../types";

  interface Props {
    item: MenuItem;
    onClose: () => void;
    onAdd: (option: string, note: string) => void;
  }

  let { item, onClose, onAdd }: Props = $props();

  let selectedOption = $state(item.optionsType === "spicy" ? "เผ็ดน้อย" : "หวานน้อย");
  let itemNote = $state("");
  const money = (n: number) => `฿${n.toFixed(2)}`;
</script>

<div
  transition:fade={{ duration: 150 }}
  class="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
  onclick={onClose}
  role="presentation"
>
  <div
    transition:fly={{ y: 80, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    class="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 rounded-2xl bg-orange-100 grid place-items-center text-2xl">
          {item.emoji}
        </div>
        <div>
          <h3 class="text-base font-extrabold text-slate-800 leading-tight">{item.name}</h3>
          <p class="text-xs text-emerald-600 font-bold mt-0.5">{money(item.price)}</p>
        </div>
      </div>
      <button onclick={onClose} class="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-500">
        <X class="w-4 h-4" />
      </button>
    </div>

    <div class="mb-4">
      <p class="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
        {#if item.optionsType === "spicy"}
          <Flame class="w-4 h-4 text-red-500" /> เลือกระดับความเผ็ด
        {:else}
          <Coffee class="w-4 h-4 text-amber-600" /> เลือกระดับความหวาน
        {/if}
      </p>
      <div class="grid grid-cols-2 gap-2">
        {#each (item.optionsType === "spicy" ? ["ไม่เผ็ดเลย", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"] : ["หวานน้อย", "หวานปกติ", "หวานมาก"]) as opt}
          <button
            onclick={() => (selectedOption = opt)}
            class={`h-11 rounded-xl text-xs font-bold transition border ${
              selectedOption === opt ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {opt}
          </button>
        {/each}
      </div>
    </div>

    <div class="mb-5">
      <p class="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
        <PenLine class="w-4 h-4 text-emerald-500" /> โน้ตเพิ่มเติม
      </p>
      <input
        bind:value={itemNote}
        placeholder="เช่น ไม่ใส่ผักชี, ขอช้อนส้อม..."
        class="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
      />
    </div>

    <button
      onclick={() => onAdd(selectedOption, itemNote)}
      class="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-98"
    >
      <ShoppingCart class="w-4 h-4" /> เพิ่มลงในตะกร้า
    </button>
  </div>
</div>