<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import X from "lucide-svelte/icons/x";
  import type { Order } from "../types";

  interface Props {
    order: Order;
    onClose: () => void;
  }

  let { order, onClose }: Props = $props();

  const money = (n: number) => `฿${n.toFixed(2)}`;
  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
</script>

<div
  transition:fade={{ duration: 150 }}
  class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
  onclick={onClose}
  role="presentation"
>
  <div
    transition:fly={{ y: 60, duration: 200 }}
    onclick={(e) => e.stopPropagation()}
    class="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-extrabold text-slate-800">ใบเสร็จรับเงินอิเล็กทรอนิกส์</h3>
      <button onclick={onClose} class="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-500">
        <X class="w-4 h-4" />
      </button>
    </div>
    <div class="text-center border-b border-dashed border-slate-200 pb-4">
      <p class="text-sm font-extrabold text-slate-800">SPU Canteen Center</p>
      <p class="text-xs text-slate-400 mt-0.5">อาคารโรงอาหาร SPU · ชั้น 1</p>
    </div>
    <div class="py-3 space-y-1.5 text-xs">
      <div class="flex justify-between text-slate-500"><span>รหัสคำสั่งซื้อ</span><span class="font-bold text-slate-800 tabnum">{order.id}</span></div>
      <div class="flex justify-between text-slate-500"><span>เวลาสั่งซื้อ</span><span class="font-medium text-slate-700 tabnum">{new Date(order.createdAt).toLocaleDateString("th-TH")} · {fmtTime(order.createdAt)}</span></div>
      <div class="flex justify-between text-slate-500"><span>เวลานัดรับ</span><span class="font-bold text-emerald-600 tabnum">{order.slot}</span></div>
      <div class="flex justify-between text-slate-500"><span>รหัสรับอาหาร</span><span class="font-black text-slate-900 tabnum">{order.code}</span></div>
    </div>
    <div class="border-t border-dashed border-slate-200 pt-3 space-y-2">
      {#each order.items as it}
        <div class="flex justify-between text-xs">
          <div class="text-slate-700 mr-2 flex-1">
            <span class="text-[10px] text-slate-400">[{it.storeName}]</span> {it.name} ×{it.qty}
            {#if it.option}
              <span class="block text-[11px] text-amber-600 ml-3">{it.option}</span>
            {/if}
          </div>
          <span class="font-semibold text-slate-800 tabnum shrink-0">{money(it.price * it.qty)}</span>
        </div>
      {/each}
    </div>
    <div class="border-t border-slate-200 mt-3 pt-3 space-y-1 text-xs">
      <div class="flex justify-between text-slate-500"><span>ยอดรวม</span><span class="tabnum">{money(order.total)}</span></div>
      <div class="flex justify-between items-center pt-2 border-t border-slate-100">
        <span class="text-sm font-bold text-slate-800">ยอดชำระทั้งสิ้น</span>
        <span class="text-lg font-black text-emerald-600 tabnum">{money(order.total)}</span>
      </div>
    </div>
    <button onclick={onClose} class="mt-5 w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition">
      ปิดหน้าต่าง
    </button>
  </div>
</div>