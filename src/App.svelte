<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fade, fly } from "svelte/transition";

  // นำเข้าไอคอนแบบ Subpath เพื่อลดขนาด Bundle ให้โหลดเร็วที่สุด
  import Search from "lucide-svelte/icons/search";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import Star from "lucide-svelte/icons/star";
  import Clock from "lucide-svelte/icons/clock";
  import Users from "lucide-svelte/icons/users";
  import MapPin from "lucide-svelte/icons/map-pin";
  import CheckCircle2 from "lucide-svelte/icons/check-circle-2";
  import ChefHat from "lucide-svelte/icons/chef-hat";
  import Bell from "lucide-svelte/icons/bell";
  import Receipt from "lucide-svelte/icons/receipt";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import Plus from "lucide-svelte/icons/plus";
  import Minus from "lucide-svelte/icons/minus";
  import Home from "lucide-svelte/icons/home";
  import History from "lucide-svelte/icons/history";
  import QrCode from "lucide-svelte/icons/qr-code";
  import Loader2 from "lucide-svelte/icons/loader-2";
  import Zap from "lucide-svelte/icons/zap";
  import Repeat from "lucide-svelte/icons/repeat";
  import X from "lucide-svelte/icons/x";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import Smartphone from "lucide-svelte/icons/smartphone";
  import Sparkles from "lucide-svelte/icons/sparkles";
  import Timer from "lucide-svelte/icons/timer";
  import BadgeCheck from "lucide-svelte/icons/badge-check";
  import LogIn from "lucide-svelte/icons/log-in";
  import GraduationCap from "lucide-svelte/icons/graduation-cap";
  import StoreIcon from "lucide-svelte/icons/store";
  import MessageSquare from "lucide-svelte/icons/message-square";
  import PenLine from "lucide-svelte/icons/pen-line";

  import { STORES, MENU, SLOTS, INITIAL_PAST_ORDERS } from "./mockData";
  import type { Screen, OrderStatus, MenuItem, CartItem, Order, OrderItem, PastOrder } from "./types";
  import OptionModal from "./components/OptionModal.svelte";
  import LoginModal from "./components/LoginModal.svelte";
  import ReceiptModal from "./components/ReceiptModal.svelte";

  // ฟังก์ชันช่วยเหลือสำหรับจัดรูปแบบการแสดงผล
  const money = (n: number) => `฿${n.toFixed(2)}`;
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtCountdown = (s: number) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

  // Application States (Svelte 5 Runes)
  let isAuthenticated = $state(false);
  let showLogin = $state(false);
  let loginLoading = $state(false);
  let afterLoginAction = $state<(() => void) | null>(null);

  let screen = $state<Screen>("home");
  let activeStoreId = $state<string>("s1");
  let cart = $state<CartItem[]>([]);
  let slot = $state<string>("12:00 น.");
  let orderNote = $state<string>("");
  let payMethod = $state<"promptpay" | "banking">("promptpay");
  let paying = $state(false);
  let query = $state("");

  // Modal & Order States
  let optionModalItem = $state<MenuItem | null>(null);
  let order = $state<Order | null>(null);
  let secondsLeft = $state(510);
  let soundOn = $state(true);
  let receiptOpen = $state(false);

  let historyOrders = $state<PastOrder[]>(INITIAL_PAST_ORDERS);
  let rating = $state(0);
  let review = $state("");
  let submittedReview = $state<{ rating: number; text: string } | null>(null);

  let demoOpen = $state(false);
  let toast = $state<string | null>(null);
  let toastTimer: number | null = null;

  const showToast = (msg: string) => {
    toast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast = null), 3400);
  };

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      afterLoginAction = () => action;
      showLogin = true;
      showToast("กรุณาเข้าสู่ระบบก่อนทำรายการ");
    }
  };

  const executeLoginSuccess = (method: string) => {
    loginLoading = true;
    setTimeout(() => {
      isAuthenticated = true;
      loginLoading = false;
      showLogin = false;
      showToast(method === "email" ? "เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับนักศึกษา SPU" : `เข้าสู่ระบบด้วย ${method} สำเร็จ!`);
      if (afterLoginAction) {
        afterLoginAction();
        afterLoginAction = null;
      }
    }, 1200);
  };

  const addItemToCart = (item: MenuItem, option: string = "", note: string = "") => {
    const cartId = `${item.id}-${option}-${note}`;
    const existing = cart.find((c) => c.cartId === cartId);
    if (existing) {
      cart = cart.map((c) => (c.cartId === cartId ? { ...c, qty: c.qty + 1 } : c));
    } else {
      cart = [...cart, { cartId, itemId: item.id, qty: 1, option, note }];
    }
    optionModalItem = null;
  };

  const handleAddClick = (item: MenuItem) => {
    requireAuth(() => {
      if (item.optionsType) {
        optionModalItem = item;
      } else {
        addItemToCart(item);
        showToast(`เพิ่ม ${item.name} ลงตะกร้าแล้ว`);
      }
    });
  };

  const decFromCart = (cartId: string) =>
    requireAuth(() => {
      cart = cart
        .map((c) => (c.cartId === cartId ? { ...c, qty: Math.max(0, c.qty - 1) } : c))
        .filter((c) => c.qty > 0);
    });

  const addFromCart = (cartId: string) =>
    requireAuth(() => {
      cart = cart.map((c) => (c.cartId === cartId ? { ...c, qty: c.qty + 1 } : c));
    });

  const handleNav = (targetScreen: Screen) => {
    if (targetScreen === "home") {
      screen = "home";
    } else {
      requireAuth(() => (screen = targetScreen));
    }
  };

  // คำนวณค่าจาก State (Derived Values)
  let cartLines = $derived(
    cart.map((c) => {
      const item = MENU.find((m) => m.id === c.itemId)!;
      const store = STORES.find((s) => s.id === item.storeId)!;
      return { ...c, item, store };
    })
  );

  let count = $derived(cartLines.reduce((s, l) => s + l.qty, 0));
  let subtotal = $derived(cartLines.reduce((s, l) => s + l.qty * l.item.price, 0));
  let total = $derived(subtotal);
  let activeStore = $derived(STORES.find((s) => s.id === activeStoreId)!);

  let filteredMenu = $derived(
    !query.trim()
      ? MENU.filter((m) => m.storeId === activeStoreId)
      : MENU.filter(
          (m) =>
            m.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            m.desc.toLowerCase().includes(query.trim().toLowerCase())
        )
  );

  const confirmOrder = () => {
    if (!count || paying) return;
    paying = true;
    setTimeout(() => {
      const items: OrderItem[] = cartLines.map((l) => ({
        name: l.item.name,
        qty: l.qty,
        price: l.item.price,
        storeName: l.store.name,
        option: l.option,
        note: l.note,
      }));
      order = {
        id: "#SPU-" + Math.floor(1000 + Math.random() * 9000),
        code: "A-" + pad(Math.floor(1 + Math.random() * 99)),
        status: 0,
        items,
        total,
        slot,
        createdAt: Date.now(),
      };
      cart = [];
      orderNote = "";
      secondsLeft = 510;
      rating = 0;
      review = "";
      submittedReview = null;
      paying = false;
      screen = "tracking";
      showToast("ชำระเงินสำเร็จ · ส่งออเดอร์ให้ร้านแล้ว 🎉");
    }, 1500);
  };

  const advanceStatus = () => {
    if (!order) return;
    const next = Math.min(2, order.status + 1) as OrderStatus;
    order = { ...order, status: next };
    if (next === 1) {
      showToast("🔔 อีก 5 นาทีจะถึงเวลานัดรับ กรุณาเตรียมตัวเดินทางมายังโรงอาหาร");
    } else if (next === 2) {
      secondsLeft = 0;
      if (soundOn && "vibrate" in navigator) navigator.vibrate?.([120, 60, 120]);
      showToast("🔔 อาหารของคุณเสร็จแล้ว! รหัส " + order.code);
    }
  };

  const completeOrder = () => {
    if (!order) return;
    const newHistory: PastOrder = {
      id: order.id,
      date:
        new Date(order.createdAt).toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " · " +
        order.slot,
      items: order.items.map((i) => `${i.name}${i.option ? ` (${i.option})` : ""} ×${i.qty}`).join(", "),
      total: order.total,
      rating: submittedReview ? submittedReview.rating : 0,
    };
    historyOrders = [newHistory, ...historyOrders];
    order = null;
    screen = "history";
    showToast("รับอาหารเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ 🙏");
  };

  const reOrder = () =>
    requireAuth(() => {
      if (!order) return;
      const newCart: CartItem[] = [];
      order.items.forEach((it) => {
        const found = MENU.find((m) => m.name === it.name);
        if (found) {
          newCart.push({
            cartId: `${found.id}-${it.option || ""}-${it.note || ""}-${Date.now()}-${Math.random()}`,
            itemId: found.id,
            qty: it.qty,
            option: it.option || "",
            note: it.note || "",
          });
        }
      });
      cart = newCart;
      screen = "checkout";
      showToast("เพิ่มเมนูเดิมลงตะกร้าแล้ว");
    });

  const submitReview = () => {
    if (!rating) return showToast("กรุณาเลือกจำนวนดาวก่อนส่งรีวิว");
    submittedReview = { rating, text: review };
    showToast("ส่งรีวิวเรียบร้อย ขอบคุณค่ะ 🙏");
  };

  onMount(() => {
    const countdownInterval = setInterval(() => {
      if (order && screen === "tracking" && order.status < 2) {
        secondsLeft = Math.max(0, secondsLeft - 1);
      }
    }, 1000);
    return () => clearInterval(countdownInterval);
  });
</script>

<div class="min-h-screen w-full bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
  <!-- Desktop / Global Navigation Header -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- แสดงรูป Logo จริงจากโฟลเดอร์ public -->
        <img
          src="/logo.png"
          alt="SPU Smart Food Queue Logo"
          class="h-11 w-11 object-contain rounded-2xl shadow-sm drop-shadow-sm"
          onerror={(e) => {
            // สำรองหากไฟล์เป็นนามสกุล .webp
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.endsWith('.webp')) target.src = '/logo.webp';
          }}
        />
        <div>
          <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
            SPU Smart Food Queue
          </h1>
          <p class="text-[11px] text-slate-400 font-medium mt-0.5">ระบบจองคิวอาหารโรงอาหารล่วงหน้า มหาวิทยาลัยศรีปทุม</p>
        </div>
      </div>

      <!-- Desktop Navigation Menu Links -->
      <nav class="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
        {#each [
          { key: "home", label: "รายการอาหาร", icon: Home },
          { key: "checkout", label: "ตะกร้าสั่งซื้อ", icon: ShoppingCart, badge: count },
          { key: "tracking", label: "สถานะออเดอร์", icon: Timer }, 
          { key: "history", label: "ประวัติการสั่ง", icon: History },
        ] as t}
          {@const active = screen === t.key}
          {@const IconComp = t.icon}
          <button
            onclick={() => handleNav(t.key as Screen)}
            class={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              active ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <IconComp class="w-4 h-4" />
            <span>{t.label}</span>
            {#if t.badge && t.badge > 0}
              <span class="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold tabnum leading-tight">
                {t.badge}
              </span>
            {/if}
          </button>
        {/each}
      </nav>

      <!-- Auth Button Area -->
      <div class="flex items-center gap-2">
        {#if isAuthenticated}
          <button
            onclick={() => { isAuthenticated = false; screen = "home"; showToast("ออกจากระบบเรียบร้อยแล้ว"); }}
            class="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition border border-slate-200/80"
          >
            <GraduationCap class="w-4 h-4 text-emerald-600" /> ออกจากระบบ
          </button>
        {:else}
          <button
            onclick={() => (showLogin = true)}
            class="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition shadow-sm"
          >
            <LogIn class="w-4 h-4" /> เข้าสู่ระบบ
          </button>
        {/if}
      </div>
    </div>
  </header>

  <!-- Notification Toast -->
  {#if toast}
    <div transition:fly={{ y: -30, duration: 200 }} class="fixed top-20 left-1/2 -translate-x-1/2 z-[70] max-w-sm w-[90%] bg-slate-900/95 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl backdrop-blur flex items-center gap-2.5">
      <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
      <span class="leading-snug">{toast}</span>
    </div>
  {/if}

  <!-- Main Container -->
  <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
    <!-- HOME SCREEN -->
    {#if screen === "home"}
      <div in:fade={{ duration: 150 }} class="space-y-6">
        <!-- Search & Filter Bar -->
        <div class="relative max-w-xl mx-auto md:mx-0">
          <Search class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            bind:value={query}
            placeholder="ค้นหาเมนูอาหาร หรือชื่อร้านค้า..."
            class="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 shadow-sm transition"
          />
        </div>

        {#if !query}
          <!-- Store Selector -->
          <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {#each STORES as s (s.id)}
              <button
                onclick={() => (activeStoreId = s.id)}
                class={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition ${
                  activeStoreId === s.id
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30"
                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50"
                }`}
              >
                <span class="text-2xl">{s.emoji}</span>
                <div>
                  <p class={`text-xs sm:text-sm font-bold leading-tight ${activeStoreId === s.id ? "text-white" : "text-slate-800"}`}>
                    {s.name}
                  </p>
                  <div class="flex items-center gap-1.5 mt-1">
                    <Star class={`w-3 h-3 ${activeStoreId === s.id ? "text-white fill-white" : "text-amber-400 fill-amber-400"}`} />
                    <span class={`text-[10px] font-semibold ${activeStoreId === s.id ? "text-emerald-50" : "text-slate-400"}`}>
                      {s.rating}
                    </span>
                  </div>
                </div>
              </button>
            {/each}
          </div>

          <!-- Active Store Banner -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3.5">
                <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur grid place-items-center text-3xl shrink-0">
                  {activeStore.emoji}
                </div>
                <div>
                  <h2 class="text-lg sm:text-xl font-black">{activeStore.name}</h2>
                  <p class="text-xs sm:text-sm text-emerald-50/90 mt-0.5">{activeStore.lock} · {activeStore.location}</p>
                </div>
              </div>
              <span class="text-xs font-bold bg-white/20 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full">
                เปิดให้บริการ
              </span>
            </div>
            <div class="grid grid-cols-3 divide-x divide-slate-100 bg-white py-3">
              <div class="flex flex-col items-center gap-0.5">
                <span class="flex items-center gap-1 text-sm sm:text-base font-extrabold text-slate-800">
                  <Star class="w-4 h-4 text-amber-400 fill-amber-400" /> {activeStore.rating}
                </span>
                <span class="text-[11px] text-slate-400 font-medium">คะแนนร้าน</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="flex items-center gap-1 text-sm sm:text-base font-extrabold text-slate-800">
                  <Clock class="w-4 h-4 text-emerald-500" /> {activeStore.cookTime}
                </span>
                <span class="text-[11px] text-slate-400 font-medium">เวลาปรุงเฉลี่ย</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="flex items-center gap-1 text-sm sm:text-base font-extrabold text-slate-800">
                  <Users class="w-4 h-4 text-orange-500" /> {activeStore.queue} คิว
                </span>
                <span class="text-[11px] text-slate-400 font-medium">คิวข้างหน้า</span>
              </div>
            </div>
          </div>
        {/if}

        <!-- Menu Section Header -->
        <div class="flex items-center justify-between pt-2">
          <h3 class="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wide">
            <Sparkles class="w-4 h-4 text-emerald-500" />
            {query ? "ผลการค้นหาเมนู" : `เมนูของ ${activeStore.name}`}
          </h3>
          <span class="text-xs text-slate-400">พบ {filteredMenu.length} รายการ</span>
        </div>

        {#if filteredMenu.length === 0}
          <div class="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center">
            <Search class="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p class="text-sm text-slate-400 font-medium">ไม่พบเมนูที่คุณกำลังค้นหา</p>
          </div>
        {/if}

        <!-- Menu Responsive Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredMenu as m (m.id)}
            {@const totalQty = cart.filter((c) => c.itemId === m.id).reduce((s, c) => s + c.qty, 0)}
            {@const storeOfItem = STORES.find((s) => s.id === m.storeId)!}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex gap-4 hover:shadow-md transition">
              <div class="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-slate-100 grid place-items-center text-4xl relative">
                {m.emoji}
                {#if m.tag}
                  <span class="absolute -top-1.5 -left-1.5 text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                    {m.tag}
                  </span>
                {/if}
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  {#if query}
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1">
                      <StoreIcon class="w-2.5 h-2.5" /> {storeOfItem.name}
                    </span>
                  {/if}
                  <h4 class="text-sm font-bold text-slate-800 leading-snug truncate">{m.name}</h4>
                  <p class="text-xs text-slate-400 leading-snug mt-1 line-clamp-2">{m.desc}</p>
                </div>
                <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span class="text-base font-extrabold text-emerald-600 tabnum">
                    {m.price} <span class="text-xs font-bold text-slate-400">บาท</span>
                  </span>
                  <button
                    onclick={() => handleAddClick(m)}
                    class="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm shadow-emerald-500/25 transition"
                  >
                    <Plus class="w-3.5 h-3.5" strokeWidth={3} /> เพิ่ม
                    {#if totalQty > 0}
                      <span class="bg-white text-emerald-600 rounded-full px-1.5 ml-0.5 text-[10px] font-black">{totalQty}</span>
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- CHECKOUT SCREEN -->
    {#if screen === "checkout"}
      <div in:fade={{ duration: 150 }} class="max-w-2xl mx-auto space-y-5">
        <div class="flex items-center gap-3">
          <button onclick={() => (screen = "home")} class="h-9 w-9 rounded-full bg-white border border-slate-200 grid place-items-center shadow-sm hover:bg-slate-50">
            <ArrowLeft class="w-4 h-4 text-slate-700" />
          </button>
          <h2 class="text-lg font-extrabold text-slate-800">ยืนยันคำสั่งซื้อของคุณ</h2>
        </div>

        {#if count === 0}
          <div class="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center px-6">
            <ShoppingCart class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-base font-bold text-slate-700">ไม่มีรายการอาหารในตะกร้า</p>
            <p class="text-xs text-slate-400 mt-1 mb-5">เลือกสั่งเมนูอาหารอร่อยจากร้านโปรดในโรงอาหารได้เลย</p>
            <button onclick={() => (screen = "home")} class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition">
              กลับไปเลือกเมนู
            </button>
          </div>
        {:else}
          <!-- Cart Items Summary -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-4">
              <Receipt class="w-4 h-4 text-emerald-500" /> รายการที่เลือกสั่ง
            </h3>
            <div class="divide-y divide-slate-100 space-y-3">
              {#each cartLines as l (l.cartId)}
                <div class="flex items-start gap-3 pt-3 first:pt-0">
                  <div class="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 grid place-items-center text-xl shrink-0 mt-0.5">{l.item.emoji}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{l.item.name}</p>
                    <p class="text-xs text-emerald-600 font-medium mb-1">{l.store.name}</p>
                    {#if l.option}
                      <span class="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded inline-block mb-1">{l.option}</span>
                    {/if}
                    {#if l.note}
                      <p class="text-[11px] text-slate-500 italic">โน้ต: {l.note}</p>
                    {/if}
                    <p class="text-xs text-slate-400 mt-0.5">{l.item.price} บาท × {l.qty}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <span class="text-sm font-extrabold text-slate-800 tabnum">{money(l.item.price * l.qty)}</span>
                    <div class="flex items-center gap-2">
                      <button onclick={() => decFromCart(l.cartId)} class="h-7 w-7 rounded-full bg-slate-100 text-slate-600 grid place-items-center hover:bg-slate-200">
                        <Minus class="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                      <span class="text-xs font-black text-slate-700 tabnum w-5 text-center">{l.qty}</span>
                      <button onclick={() => addFromCart(l.cartId)} class="h-7 w-7 rounded-full bg-emerald-500 text-white grid place-items-center hover:bg-emerald-600">
                        <Plus class="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <div class="mt-4 pt-4 border-t border-dashed border-slate-200 space-y-2">
              <div class="flex justify-between text-xs text-slate-500">
                <span>ยอดรวมค่าอาหาร</span><span class="tabnum font-semibold text-slate-700">{money(subtotal)}</span>
              </div>
              <div class="flex justify-between text-xs text-slate-500">
                <span>ส่วนลดนักศึกษา SPU</span><span class="tabnum font-semibold text-emerald-600">- ฿0.00</span>
              </div>
              <div class="flex justify-between items-end pt-2 border-t border-slate-100">
                <span class="text-sm font-bold text-slate-800">ยอดชำระสุทธิ</span>
                <span class="text-2xl font-black text-emerald-600 tabnum leading-none">{money(total)}</span>
              </div>
            </div>
          </div>

          <!-- Time Slot Selection -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3">
              <Timer class="w-4 h-4 text-emerald-500" /> เวลานัดรับอาหาร (Time Slot)
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {#each SLOTS as s}
                <button
                  onclick={() => (slot = s)}
                  class={`h-11 rounded-xl text-xs font-bold transition border tabnum active:scale-95 ${
                    slot === s
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {s}
                </button>
              {/each}
            </div>
          </div>

          <!-- Order Note -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3">
              <MessageSquare class="w-4 h-4 text-emerald-500" /> หมายเหตุเพิ่มเติมถึงร้านค้า
            </h3>
            <div class="relative">
              <PenLine class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                bind:value={orderNote}
                placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย, ขอช้อนส้อม..."
                class="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <!-- Payment Section -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3">
              <QrCode class="w-4 h-4 text-emerald-500" /> เลือกช่องทางชำระเงิน
            </h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <button
                onclick={() => (payMethod = "promptpay")}
                class={`h-12 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                  payMethod === "promptpay" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <QrCode class="w-4 h-4" /> QR PromptPay
              </button>
              <button
                onclick={() => (payMethod = "banking")}
                class={`h-12 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                  payMethod === "banking" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <Smartphone class="w-4 h-4" /> Mobile Banking
              </button>
            </div>

            {#if payMethod === "promptpay"}
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center">
                <div class="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80 max-w-[220px] w-full flex justify-center">
                  <!-- ดึงรูป QR Code จริงจาก public/qrcode.webp -->
                  <img
                    src="/qrcode.webp"
                    alt="QR Code สำหรับสแกนจ่ายเงิน SPU Canteen"
                    class="w-full h-auto object-contain rounded-xl"
                  />
                </div>
                <div class="mt-3 text-center">
                  <p class="text-xs font-bold text-slate-700">สแกนชำระเงิน: SPU Canteen Center</p>
                  <p class="text-xl font-black text-emerald-600 tabnum mt-0.5">{money(total)}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">รองรับทุกแอปพลิเคชันธนาคาร (PromptPay)</p>
                </div>
              </div>
            {:else}
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                {#each ["ธนาคารกสิกรไทย (K PLUS)", "ธนาคารไทยพาณิชย์ (SCB EASY)", "ธนาคารกรุงไทย (KTB NEXT)"] as b}
                  <div class="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
                    <span class="text-xs font-semibold text-slate-700">{b}</span>
                    <ChevronRight class="w-4 h-4 text-slate-400" />
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <button
            onclick={confirmOrder}
            disabled={paying}
            class="w-full h-14 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white shadow-xl shadow-emerald-500/30 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {#if paying}
              <Loader2 class="w-5 h-5 animate-spin" />
              กำลังดำเนินการสั่งซื้อ...
            {:else}
              ยืนยันการสั่งซื้อและชำระเงิน · {money(total)}
            {/if}
          </button>
        {/if}
      </div>
    {/if}

    <!-- TRACKING SCREEN --> 
    {#if screen === "tracking"}
      <div in:fade={{ duration: 150 }} class="max-w-2xl mx-auto space-y-5">
        {#if !order}
          <div class="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center px-6">
            <Timer class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-base font-bold text-slate-700">ยังไม่มีรายการสั่งอาหารที่กำลังดำเนินการ</p>
            <button onclick={() => (screen = "home")} class="mt-4 bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25">
              เริ่มสั่งอาหารทันที
            </button>
          </div>
        {:else}
          {#if order.status === 2}
            <div transition:slide class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-start gap-3">
              <div class="h-10 w-10 rounded-2xl bg-white/20 grid place-items-center shrink-0">
                <Bell class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-black leading-snug">🔔 อาหารของคุณพร้อมรับแล้ว!</p>
                <p class="text-xs text-emerald-50 leading-snug mt-0.5">คำสั่งซื้อ {order.id} (รหัส {order.code}) สามารถนำรหัสไปรับได้ที่ช่องบริการ</p>
              </div>
            </div> 
          {/if}

          <!-- Pickup Ticket Code -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">หมายเลขคำสั่งซื้อ</p>
                <span class="text-base font-black text-slate-800 tabnum">{order.id}</span>
              </div>
              <span class={`text-xs font-bold px-3 py-1.5 rounded-full ${
                order.status === 2 ? "bg-emerald-100 text-emerald-700" : order.status === 1 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}>
                {order.status === 0 ? "รับออเดอร์แล้ว" : order.status === 1 ? "กำลังปรุงอาหาร" : "พร้อมรับอาหาร"}
              </span>
            </div>

            <div class="mt-4 rounded-3xl bg-slate-900 p-6 text-center text-white relative overflow-hidden shadow-inner">
              <p class="text-xs text-slate-400 font-semibold tracking-wide">รหัสรับอาหารของคุณ</p>
              <p class="text-5xl sm:text-6xl font-black text-emerald-400 leading-none tracking-tight tabnum mt-2">{order.code}</p>
            </div>

            <div class="mt-4 divide-y divide-slate-100">
              <div class="py-2 space-y-1">
                {#each order.items as i}
                  <div class="text-xs text-slate-700 font-medium">
                    <span class="text-slate-400">[{i.storeName}]</span> {i.name} ×{i.qty}
                    {#if i.option}
                      <span class="text-amber-600 ml-1">({i.option})</span>
                    {/if}
                    {#if i.note}
                      <span class="text-slate-400 block ml-4 italic">โน้ต: {i.note}</span>
                    {/if}
                  </div>
                {/each}
              </div>
              <div class="pt-2 flex justify-between items-center text-xs text-slate-500">
                <span>เวลานัดรับ</span>
                <span class="font-bold text-emerald-600 tabnum text-sm">{order.slot}</span>
              </div>
            </div>
          </div>

          <!-- Progress Timeline -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-4">
              <Zap class="w-4 h-4 text-emerald-500" /> สถานะคิวอาหารแบบเรียลไทม์
            </h3>
            <div class="relative flex justify-between my-4">
              <div class="absolute left-[16.6%] right-[16.6%] top-5 h-1 bg-slate-100 rounded-full"></div>
              <div class="absolute left-[16.6%] top-5 h-1 bg-emerald-500 rounded-full transition-all duration-300" style={`width: ${(order.status / 2) * 66.8}%`}></div>

              <div class="flex flex-col items-center gap-2 z-10 w-1/3">
                <div class={`h-11 w-11 rounded-full grid place-items-center border-2 transition ${order.status >= 0 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-300"}`}>
                  <Receipt class="w-5 h-5" />
                </div>
                <span class={`text-xs font-bold ${order.status >= 0 ? "text-emerald-700" : "text-slate-400"}`}>รับออเดอร์</span>
              </div>

              <div class="flex flex-col items-center gap-2 z-10 w-1/3">
                <div class={`h-11 w-11 rounded-full grid place-items-center border-2 transition ${order.status >= 1 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-300"}`}>
                  <ChefHat class="w-5 h-5" />
                </div>
                <span class={`text-xs font-bold ${order.status >= 1 ? "text-emerald-700" : "text-slate-400"}`}>กำลังปรุง</span>
              </div>

              <div class="flex flex-col items-center gap-2 z-10 w-1/3">
                <div class={`h-11 w-11 rounded-full grid place-items-center border-2 transition ${order.status >= 2 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-300"}`}>
                  <CheckCircle2 class="w-5 h-5" />
                </div>
                <span class={`text-xs font-bold ${order.status >= 2 ? "text-emerald-700" : "text-slate-400"}`}>พร้อมรับ</span>
              </div>
            </div>

            <button
              onclick={advanceStatus}
              disabled={order.status === 2}
              class={`mt-2 w-full h-10 rounded-xl border-2 border-dashed text-xs font-bold transition ${
                order.status === 2 ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <Zap class="w-3.5 h-3.5 inline mr-1" />
              {order.status === 2 ? "ออเดอร์เสร็จสมบูรณ์แล้ว" : "[Simulate Next Status] จำลองสถานะถัดไป"}
            </button>
          </div>

          <!-- Countdown and Pick up Map -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3">
              <Timer class="w-4 h-4 text-emerald-500" /> เวลานับถอยหลังโดยประมาณ
            </h3>
            <div class="rounded-2xl bg-slate-900 py-4 text-center mb-3">
              <p class="text-4xl font-black text-emerald-400 tabnum tracking-widest">{fmtCountdown(secondsLeft)}</p>
            </div>
            <div class="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
              <div class="h-9 w-9 rounded-xl bg-emerald-100 grid place-items-center shrink-0">
                <MapPin class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p class="text-xs font-black text-emerald-900">จุดรับอาหาร</p>
                <p class="text-xs text-emerald-700 mt-0.5">
                  {Array.from(new Set(order.items.map((it) => it.storeName))).join(", ")} <br/>
                  อาคารโรงอาหาร SPU · <span class="font-bold underline">ช่องบริการด่วน 2</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button onclick={reOrder} class="h-12 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 shadow-sm">
              <Repeat class="w-4 h-4 text-emerald-600" /> สั่งเมนูเดิมอีกครั้ง
            </button>
            <button onclick={() => (receiptOpen = true)} class="h-12 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 shadow-sm">
              <Receipt class="w-4 h-4 text-emerald-600" /> ดูใบเสร็จรับเงิน
            </button>
          </div>

          {#if order.status === 2}
            <button onclick={completeOrder} class="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition">
              <CheckCircle2 class="w-5 h-5" /> ได้รับอาหารเรียบร้อยแล้ว
            </button>
          {/if}

          <!-- Review Box -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3">
              <Star class="w-4 h-4 text-amber-400" /> ให้คะแนนความพึงพอใจ
            </h3>
            {#if submittedReview}
              <div class="text-center py-3">
                <div class="flex justify-center gap-1.5 mb-2">
                  {#each [1, 2, 3, 4, 5] as n}
                    <Star class={`w-6 h-6 ${n <= submittedReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                  {/each}
                </div>
                <p class="text-xs font-bold text-emerald-600">ขอบคุณสำหรับคะแนนและคำติชมของคุณ!</p>
              </div>
            {:else}
              <div class="flex justify-center gap-3 mb-4">
                {#each [1, 2, 3, 4, 5] as n}
                  <button onclick={() => (rating = n)} class="p-1 active:scale-90 transition">
                    <Star class={`w-9 h-9 transition-colors ${n <= rating ? "text-amber-400 fill-amber-400 drop-shadow" : "text-slate-200 hover:text-amber-200"}`} />
                  </button>
                {/each}
              </div>
              <textarea bind:value={review} rows={2} placeholder="เขียนรีวิวสั้น ๆ เกี่ยวกับรสชาติและการให้บริการ..." class="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none"></textarea>
              <button onclick={submitReview} class={`mt-3 w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${rating ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                <BadgeCheck class="w-4 h-4" /> ส่งความคิดเห็น
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    <!-- HISTORY SCREEN -->
    {#if screen === "history"}
      <div in:fade={{ duration: 150 }} class="max-w-2xl mx-auto space-y-4">
        <h2 class="text-lg font-extrabold text-slate-800">ประวัติคำสั่งซื้อทั้งหมด</h2>
        <div class="space-y-3">
          {#each historyOrders as o (o.id)}
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-sm font-black text-slate-800 tabnum">{o.id}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{o.date}</p>
                </div>
                <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">เสร็จสิ้น</span>
              </div>
              <p class="text-xs text-slate-600 mt-2.5">{o.items}</p>
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div class="flex gap-1">
                  {#each [1, 2, 3, 4, 5] as n}
                    <Star class={`w-4 h-4 ${n <= o.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                  {/each}
                </div>
                <span class="text-base font-black text-emerald-600 tabnum">{money(o.total)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </main>

  <!-- Mobile Floating Cart Bar (แสดงเฉพาะหน้าจอมือถือ) -->
  {#if screen === "home" && count > 0}
    <div transition:fly={{ y: 90, duration: 200 }} class="md:hidden fixed left-4 right-4 bottom-20 z-30">
      <div class="bg-slate-900 rounded-2xl p-3 shadow-2xl flex items-center justify-between border border-slate-800">
        <div class="flex items-center gap-3">
          <div class="relative h-10 w-10 rounded-xl bg-emerald-500 grid place-items-center text-white">
            <ShoppingCart class="w-5 h-5" />
            <span class="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-white text-slate-900 text-[10px] font-black grid place-items-center">{count}</span>
          </div>
          <div>
            <p class="text-[11px] text-slate-400 leading-none">สั่งรวม {count} รายการ</p>
            <p class="text-base font-extrabold text-white tabnum leading-tight mt-1">{money(total)}</p>
          </div>
        </div>
        <button onclick={() => requireAuth(() => (screen = "checkout"))} class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/25">
          ชำระเงิน <ChevronRight class="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  {/if}

  <!-- Mobile Bottom Navigation Bar (แสดงเฉพาะหน้าจอมือถือ) -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 py-2 px-3">
    <div class="flex items-center justify-around">
      {#each [
        { key: "home", label: "เมนูอาหาร", icon: Home },
        { key: "checkout", label: "ตะกร้า", icon: ShoppingCart, badge: count },
        { key: "tracking", label: "สถานะ", icon: Timer },
        { key: "history", label: "ประวัติ", icon: History },
      ] as t}
        {@const active = screen === t.key}
        {@const IconComp = t.icon}
        <button onclick={() => handleNav(t.key as Screen)} class="relative flex flex-col items-center gap-1 py-1 px-3">
          <span class={`relative transition-colors ${active ? "text-emerald-600" : "text-slate-400"}`}>
            <IconComp class="w-5 h-5" />
            {#if t.badge && t.badge > 0}
              <span class="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-black grid place-items-center tabnum">{t.badge}</span>
            {/if}
          </span>
          <span class={`text-[10px] font-bold ${active ? "text-emerald-600" : "text-slate-500"}`}>{t.label}</span>
          {#if active}
            <span class="absolute -bottom-1 h-1 w-1 rounded-full bg-emerald-500"></span>
          {/if}
        </button>
      {/each}
    </div>
  </nav>

  <!-- Demo Control Widget (Floating FAB) -->
  <div class="fixed right-4 bottom-24 md:bottom-6 z-40 flex flex-col items-end gap-2">
    {#if demoOpen}
      <div transition:fly={{ y: 12, duration: 150 }} class="bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl w-48 border border-slate-700 text-white">
        <p class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest px-1 mb-2">จำลองหน้าจอ Demo</p>
        <div class="grid grid-cols-2 gap-1.5">
          {#each [
            { key: "home", label: "Menu", icon: Home },
            { key: "checkout", label: "Cart", icon: ShoppingCart },
            { key: "tracking", label: "Track", icon: Timer },
            { key: "history", label: "History", icon: History },
          ] as b}
            {@const IconComp = b.icon}
            <button
              onclick={() => { handleNav(b.key as Screen); demoOpen = false; }}
              class={`h-8 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                screen === b.key ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <IconComp class="w-3 h-3" />{b.label}
            </button>
          {/each}
        </div>
        <div class="h-px bg-white/10 my-2.5"></div>
        <p class="text-[10px] font-bold text-slate-400 px-1 mb-1.5">ข้ามขั้นตอนสถานะ</p>
        <div class="space-y-1">
          {#each ["1. รับออเดอร์", "2. กำลังปรุง", "3. พร้อมรับ"] as label, i}
            <button
              disabled={!order}
              onclick={() => {
                if (!order) return;
                order = { ...order, status: i as OrderStatus };
                if (i === 1) {
                  showToast("🔔 อีก 5 นาทีจะถึงเวลานัดรับ กรุณาเตรียมตัวเดินทางมายังโรงอาหาร");
                } else if (i === 2) {
                  secondsLeft = 0;
                  showToast("🔔 อาหารของคุณเสร็จแล้ว! รหัส " + order.code);
                }
              }}
              class={`w-full h-7 rounded-lg text-[10px] font-bold transition ${
                !order ? "bg-white/5 text-slate-600 cursor-not-allowed" : order.status === i ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    <button onclick={() => (demoOpen = !demoOpen)} class="h-11 w-11 rounded-full bg-slate-900 text-emerald-400 shadow-xl grid place-items-center border border-slate-700 hover:scale-105 active:scale-95 transition">
      {#if demoOpen}
        <X class="w-5 h-5" />
      {:else}
        <Zap class="w-5 h-5" />
      {/if}
    </button>
  </div>

  <!-- MODALS -->
  {#if optionModalItem}
    <OptionModal
      item={optionModalItem}
      onClose={() => (optionModalItem = null)}
      onAdd={(opt, note) => {
        addItemToCart(optionModalItem!, opt, note);
        showToast(`เพิ่ม ${optionModalItem!.name} ลงตะกร้าแล้ว`);
      }}
    />
  {/if}

  {#if showLogin}
    <LoginModal
      loading={loginLoading}
      onClose={() => (showLogin = false)}
      onLogin={(method) => executeLoginSuccess(method)}
    />
  {/if}

  {#if receiptOpen && order}
    <ReceiptModal
      {order}
      onClose={() => (receiptOpen = false)}
    />
  {/if}
</div>