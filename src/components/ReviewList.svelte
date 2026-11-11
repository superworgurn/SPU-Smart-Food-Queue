<script lang="ts">
  import Star from "lucide-svelte/icons/star";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import PenLine from "lucide-svelte/icons/pen-line";
  import User from "lucide-svelte/icons/user";
  import Flag from "lucide-svelte/icons/flag";
  import StoreIcon from "lucide-svelte/icons/store";
  import { STORES } from "../mockData";
  import type { Review } from "../types";

  interface Props {
    reviews: Review[];
    currentUserId: string;
    onEdit: (review: Review) => void;
    onDelete: (id: string) => void;
    onReport: (review: Review) => void;
    storeFilter?: string;
  }

  let { reviews, currentUserId, onEdit, onDelete, onReport, storeFilter }: Props = $props();

  const getStoreName = (storeId: string) => STORES.find(s => s.id === storeId)?.name ?? "ไม่ทราบร้าน";
  const getStoreEmoji = (storeId: string) => STORES.find(s => s.id === storeId)?.emoji ?? "🏪";

  // ⬇️ รีวิวของฉัน → เฉพาะร้านที่เลือกอยู่เท่านั้น (คอมเมนต์ป้าศรีไม่ไปโผล่ร้านอื่น)
  let myReviews = $derived(
    reviews
      .filter(r => r.userId === currentUserId)
      .filter(r => !storeFilter || r.storeId === storeFilter)
      .sort((a, b) => b.date - a.date)
  );

  // รีวิวจากผู้อื่น → เฉพาะร้านที่เลือกอยู่
  let displayReviews = $derived(
    reviews
      .filter(r => r.userId !== currentUserId)
      .filter(r => !storeFilter || r.storeId === storeFilter)
      .sort((a, b) => b.date - a.date)
      .slice(0, 5)
  );

  let currentStoreName = $derived(storeFilter ? getStoreName(storeFilter) : "");
  let currentStoreEmoji = $derived(storeFilter ? getStoreEmoji(storeFilter) : "🏪");
</script>

<div class="space-y-4">
  <!-- ===== รีวิวของฉัน (เฉพาะร้านที่เลือก) ===== -->
  {#if myReviews.length > 0}
    <div>
      <h3 class="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
        <PenLine class="w-4 h-4 text-emerald-500" />
        รีวิวของฉัน
        {#if storeFilter}
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <StoreIcon class="w-2.5 h-2.5" /> {currentStoreEmoji} {currentStoreName}
          </span>
        {/if}
        <span class="text-[10px] font-bold text-slate-400">({myReviews.length})</span>
      </h3>
      <div class="space-y-2">
        {#each myReviews as r (r.id)}
          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <div class="flex gap-0.5">
                    {#each [1, 2, 3, 4, 5] as n}
                      <Star class={`w-3.5 h-3.5 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                    {/each}
                  </div>
                  <span class="text-[10px] text-slate-500 font-medium">
                    {new Date(r.date).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed">{r.text}</p>
              </div>
              <div class="flex gap-1 shrink-0">
                <button
                  onclick={() => onEdit(r)}
                  class="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white grid place-items-center transition"
                  title="แก้ไข"
                  aria-label="แก้ไขรีวิว"
                >
                  <PenLine class="w-3.5 h-3.5" />
                </button>
                <button
                  onclick={() => onDelete(r.id)}
                  class="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white grid place-items-center transition"
                  title="ลบ"
                  aria-label="ลบรีวิว"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if storeFilter}
    <div class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-center">
      <PenLine class="w-6 h-6 text-slate-300 mx-auto mb-2" />
      <p class="text-xs font-bold text-slate-500">คุณยังไม่ได้รีวิว {currentStoreEmoji} {currentStoreName}</p>
      <p class="text-[10px] text-slate-400 mt-1">สั่งซื้อและรับอาหารเสร็จแล้ว สามารถกด "เขียนรีวิว" ได้จากหน้าประวัติการสั่ง</p>
    </div>
  {/if}

  <!-- ===== รีวิวจากผู้อื่น (เฉพาะร้านที่เลือก) ===== -->
  {#if displayReviews.length > 0}
    <div>
      <h3 class="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
        <User class="w-4 h-4 text-slate-500" />
        รีวิวจากผู้อื่น
        {#if storeFilter}
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            <StoreIcon class="w-2.5 h-2.5" /> {currentStoreEmoji} {currentStoreName}
          </span>
        {/if}
        <span class="text-[10px] font-bold text-slate-400">({displayReviews.length})</span>
      </h3>
      <div class="space-y-2">
        {#each displayReviews as r (r.id)}
          <div class="bg-white border border-slate-200 rounded-2xl p-4">
            <div class="flex items-start gap-2">
              <div class="h-7 w-7 rounded-full bg-slate-100 grid place-items-center shrink-0 mt-0.5">
                <User class="w-4 h-4 text-slate-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 truncate">{r.userName}</p>
                    <p class="text-[10px] text-slate-400">
                      {new Date(r.date).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div class="flex gap-0.5 shrink-0">
                    {#each [1, 2, 3, 4, 5] as n}
                      <Star class={`w-3 h-3 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                    {/each}
                  </div>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">{r.text}</p>
              </div>
              <button
                onclick={() => onReport(r)}
                class="h-7 w-7 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 grid place-items-center transition shrink-0 mt-0.5"
                title="รายงานรีวิวไม่เหมาะสม"
                aria-label="รายงานรีวิว"
              >
                <Flag class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
      <p class="text-xs text-slate-400">ยังไม่มีรีวิวจากผู้อื่นสำหรับร้านนี้</p>
    </div>
  {/if}
</div>