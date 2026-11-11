<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fade, fly } from "svelte/transition";

  // Icons
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
  import Flame from "lucide-svelte/icons/flame";
  import Rocket from "lucide-svelte/icons/rocket";
  import TrendingUp from "lucide-svelte/icons/trending-up";
  import WifiOff from "lucide-svelte/icons/wifi-off";
  import Wifi from "lucide-svelte/icons/wifi";
  import UserCircle from "lucide-svelte/icons/user-circle";

  import { STORES, MENU, SLOTS, INITIAL_PAST_ORDERS, INITIAL_REVIEWS } from "./mockData";
  import type { Screen, OrderStatus, MenuItem, CartItem, Order, OrderItem, PastOrder, Review, LiveOrder } from "./types";
  import OptionModal from "./components/OptionModal.svelte";
  import LoginModal from "./components/LoginModal.svelte";
  import ReceiptModal from "./components/ReceiptModal.svelte";
  import ReviewList from "./components/ReviewList.svelte";
  import EditReviewModal from "./components/EditReviewModal.svelte";
  import ReportModal from "./components/ReportModal.svelte";
  import ReviewModal from "./components/ReviewModal.svelte";

  const money = (n: number) => `฿${n.toFixed(2)}`;
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtCountdown = (s: number) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

  const loadFromStorage = <T,>(key: string, fallback: T): T => {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch { return fallback; }
  };

  const saveToStorage = (key: string, value: unknown) => {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  const calculateOrderDuration = (items: OrderItem[]): number => {
    const prepTimes = items.map(item => {
      const menuItem = MENU.find(m => m.name === item.name);
      if (!menuItem?.prepTime) return 5;
      const match = menuItem.prepTime.match(/(\d+)/);
      return match ? parseInt(match[1]) : 5;
    });
    const maxPrepTime = Math.max(...prepTimes, 3);
    const queueBuffer = Math.min(items.length * 2, 10);
    return (maxPrepTime + queueBuffer) * 60;
  };

  const inferStoreIdFromItems = (itemsText: string): string => {
    const found = MENU.find(m => itemsText.includes(m.name));
    return found?.storeId ?? "s1";
  };

  const migrateHistory = (history: PastOrder[]): PastOrder[] =>
    history.map(h => (h.storeId ? h : { ...h, storeId: inferStoreIdFromItems(h.items) }));

  const migrateReviews = (revs: Review[], history: PastOrder[]): Review[] =>
    revs.map(r => {
      if (r.orderId) {
        const h = history.find(x => x.id === r.orderId);
        if (h && h.storeId && h.storeId !== r.storeId) return { ...r, storeId: h.storeId };
      }
      return r;
    });

  // ===== ธนาคาร (คลิกเลือกได้) =====
  interface BankOption { id: string; name: string; app: string; }
  const BANKS: BankOption[] = [
    { id: "kbank", name: "ธนาคารกสิกรไทย", app: "K PLUS" },
    { id: "scb", name: "ธนาคารไทยพาณิชย์", app: "SCB EASY" },
    { id: "ktb", name: "ธนาคารกรุงไทย", app: "KTB NEXT" },
  ];

  // ===== สถิติสด =====
  interface StoreLiveStats { ordering: number; cooking: number; ready: number; active: number; total: number; }
  const ACTIVE_MIN = 10, ACTIVE_MAX = 20, READY_MIN = 2, READY_MAX = 8, SIM_TICK_MS = 2500;

  const createSimOrder = (storeId: string, status: OrderStatus): LiveOrder => ({
    id: "SIM-" + Math.random().toString(36).slice(2, 8),
    storeIds: [storeId], status, isMine: false,
    customer: "นักศึกษา " + Math.floor(66000000 + Math.random() * 999999),
  });

  const seedLiveOrders = (): LiveOrder[] => {
    const list: LiveOrder[] = [];
    for (const s of STORES) {
      const active = ACTIVE_MIN + Math.floor(Math.random() * (ACTIVE_MAX - ACTIVE_MIN + 1));
      for (let i = 0; i < active; i++) list.push(createSimOrder(s.id, (Math.random() < 0.5 ? 0 : 1) as OrderStatus));
      const ready = READY_MIN + Math.floor(Math.random() * (READY_MAX - READY_MIN + 1));
      for (let i = 0; i < ready; i++) list.push(createSimOrder(s.id, 2));
    }
    return list;
  };

  // ============ States ============
  let isAuthenticated = $state(true);
  let currentUserId = $state<string>("67141977");
  let currentUserName = $state<string>("ชารีฟ");
  let lastLoginMethod = $state(
    typeof localStorage !== 'undefined' && localStorage.getItem('lastLogin')
      ? localStorage.getItem('lastLogin')!
      : 'Google'
  );
  let showLogin = $state(false);
  let loginLoading = $state(false);
  let afterLoginAction = $state<(() => void) | null>(null);
  let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);
  let screen = $state<Screen>("home");
  let activeStoreId = $state<string>("s1");
  let cart = $state<CartItem[]>([]);
  let slot = $state<string>("12:00 น.");
  let orderNote = $state<string>("");
  let payMethod = $state<"promptpay" | "banking">("promptpay");
  let selectedBank = $state<string | null>(null);
  let paying = $state(false);
  let query = $state("");
  let optionModalItem = $state<MenuItem | null>(null);
  let order = $state<Order | null>(null);
  let secondsLeft = $state(0);
  let soundOn = $state(true);
  let receiptOpen = $state(false);

  const seededHistory = migrateHistory(loadFromStorage<PastOrder[]>('spu_history', INITIAL_PAST_ORDERS));
  let historyOrders = $state<PastOrder[]>(seededHistory);
  let reviews = $state<Review[]>(migrateReviews(loadFromStorage<Review[]>('spu_reviews', INITIAL_REVIEWS), seededHistory));

  $effect(() => { saveToStorage('spu_history', historyOrders); });
  $effect(() => { saveToStorage('spu_reviews', reviews); });

  let liveOrders = $state<LiveOrder[]>(seedLiveOrders());
  let rating = $state(0);
  let review = $state("");
  let submittedReview = $state<{ rating: number; text: string } | null>(null);
  let editingReview = $state<Review | null>(null);
  let reportingReview = $state<Review | null>(null);
  let reviewingHistory = $state<PastOrder | null>(null);

  let reviewModalData = $derived.by(() => {
    const target = reviewingHistory;
    if (!target) return null;
    const storeId = target.storeId ?? inferStoreIdFromItems(target.items);
    const store = STORES.find(s => s.id === storeId);
    return { order: target, store, storeId };
  });

  let myOrderStoreIds = $derived.by(() => {
    if (!order) return [];
    return Array.from(new Set(order.items.map(i => MENU.find(m => m.name === i.name)?.storeId ?? "s1")));
  });

  let storeStats = $derived.by(() => {
    const map: Record<string, StoreLiveStats> = {};
    for (const s of STORES) {
      const rel = liveOrders.filter(o => o.storeIds.includes(s.id));
      const ordering = rel.filter(o => o.status === 0).length;
      const cooking = rel.filter(o => o.status === 1).length;
      const ready = rel.filter(o => o.status === 2).length;
      map[s.id] = { ordering, cooking, ready, active: ordering + cooking, total: rel.length };
    }
    return map;
  });

  let selectedBankObj = $derived(BANKS.find(b => b.id === selectedBank) ?? null);
  let demoOpen = $state(false);
  let toast = $state<string | null>(null);
  let toastTimer: number | null = null;

  const showToast = (msg: string) => {
    toast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast = null), 3400);
  };

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) action();
    else { afterLoginAction = () => action; showLogin = true; showToast("กรุณาเข้าสู่ระบบก่อนทำรายการ"); }
  };

  const selectBank = (b: BankOption) => {
    selectedBank = b.id;
    showToast(`เลือกชำระเงินผ่าน ${b.name} (${b.app}) แล้ว`);
  };

  const executeLoginSuccess = (method: string) => {
    loginLoading = true;
    setTimeout(() => {
      isAuthenticated = true; currentUserId = "67141977"; currentUserName = "ชารีฟ";
      loginLoading = false; showLogin = false;
      localStorage.setItem('lastLogin', method); lastLoginMethod = method;
      showToast(method === "email" ? "เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับนักศึกษา SPU" : `เข้าสู่ระบบด้วย ${method} สำเร็จ!`);
      if (afterLoginAction) { afterLoginAction(); afterLoginAction = null; }
    }, 1200);
  };

  const handleLogout = () => {
    isAuthenticated = false; currentUserId = ""; currentUserName = "";
    screen = "home"; cart = [];
    showToast("ออกจากระบบเรียบร้อยแล้ว");
  };

  // ⬇️ จำกัดสูงสุด 3 ชิ้นต่อเมนู (แทนที่ 10)
  const addItemToCart = (item: MenuItem, option: string = "", note: string = "") => {
    const cartId = `${item.id}-${option}-${note}`;
    const existing = cart.find((c) => c.itemId === item.id && c.option === option && c.note === note);
    if (existing) {
      if (existing.qty >= 3) {
        showToast("⚠️ สูงสุด 3 ชิ้นต่อเมนูต่อรอบการสั่งซื้อ");
        optionModalItem = null;
        return;
      }
      cart = cart.map((c) => (c.cartId === existing.cartId ? { ...c, qty: c.qty + 1 } : c));
    } else {
      cart = [...cart, { cartId, itemId: item.id, qty: 1, option, note }];
    }
    optionModalItem = null;
  };

  const handleAddClick = (item: MenuItem) => {
    requireAuth(() => {
      if (!isOnline) showToast("⚠️ ออฟไลน์อยู่ - สามารถเพิ่มลงตะกร้าได้ แต่จะส่งออเดอร์ไม่ได้");
      if (item.optionsType) optionModalItem = item;
      else { addItemToCart(item); showToast(`เพิ่ม ${item.name} ลงตะกร้าแล้ว`); }
    });
  };

  const decFromCart = (cartId: string) => requireAuth(() => {
    cart = cart.map((c) => (c.cartId === cartId ? { ...c, qty: Math.max(0, c.qty - 1) } : c)).filter((c) => c.qty > 0);
  });

  // ⬇️ จำกัดสูงสุด 3 ชิ้นต่อเมนู (แทนที่ 10)
  const addFromCart = (cartId: string) => requireAuth(() => {
    cart = cart.map((c) => (c.cartId === cartId && c.qty < 3 ? { ...c, qty: c.qty + 1 } : c));
  });

  const handleNav = (targetScreen: Screen) => {
    if (targetScreen === "home") screen = "home";
    else requireAuth(() => (screen = targetScreen));
  };

  let cartLines = $derived(cart.map((c) => {
    const item = MENU.find((m) => m.id === c.itemId)!;
    const store = STORES.find((s) => s.id === item.storeId)!;
    return { ...c, item, store };
  }));

  let count = $derived(cartLines.reduce((s, l) => s + l.qty, 0));
  let subtotal = $derived(cartLines.reduce((s, l) => s + l.qty * l.item.price, 0));
  let total = $derived(subtotal);
  let activeStore = $derived(STORES.find((s) => s.id === activeStoreId)!);

  let filteredMenu = $derived(
    !query.trim()
      ? MENU.filter((m) => m.storeId === activeStoreId)
      : MENU.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()) || m.desc.toLowerCase().includes(query.trim().toLowerCase()))
  );

  let topMenus = $derived([...MENU].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 3));
  let newStores = $derived(STORES.filter(s => s.isNew));
  let trendingStores = $derived(STORES.filter(s => s.trending));

  const confirmOrder = () => {
    if (!count || paying) return;
    if (!isOnline) { showToast("❌ ไม่สามารถส่งออเดอร์ได้ ขณะนี้คุณออฟไลน์อยู่"); return; }
    if (payMethod === "banking" && !selectedBank) { showToast("กรุณาเลือกธนาคารก่อนชำระเงิน"); return; }

    // ⬇️ เพิ่มการเตือนเมื่อสั่งเกิน 10 ชิ้นทุกร้านรวมกัน
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalItems > 10) {
      showToast(`⚠️ คุณสั่งทั้งหมด ${totalItems} ชิ้น ซึ่งเกินขีดจำกัด 10 ชิ้น ต้องการยืนยันหรือไม่?`);
    }

    paying = true;
    setTimeout(() => {
      const items: OrderItem[] = cartLines.map((l) => ({
        name: l.item.name, qty: l.qty, price: l.item.price,
        storeName: l.store.name, option: l.option, note: l.note,
      }));
      const newOrder: Order = {
        id: "#SPU-" + String(Date.now()).slice(-6),
        code: "A-" + pad(Math.floor(1 + Math.random() * 99)),
        status: 0, items, total, slot, createdAt: Date.now(),
      };
      order = newOrder;
      secondsLeft = calculateOrderDuration(items);
      const storeIds = Array.from(new Set(items.map(i => MENU.find(m => m.name === i.name)?.storeId ?? "s1")));
      liveOrders = [...liveOrders.filter(o => !o.isMine), { id: newOrder.id, storeIds, status: 0, isMine: true, customer: currentUserName }];
      cart = []; orderNote = ""; rating = 0; review = ""; submittedReview = null;
      paying = false; screen = "tracking";
      showToast("ชำระเงินสำเร็จ · ส่งออเดอร์ให้ร้านแล้ว 🎉");
    }, 1500);
  };

  const advanceStatus = () => {
    if (!order) return;
    const next = Math.min(2, order.status + 1) as OrderStatus;
    order = { ...order, status: next };
    liveOrders = liveOrders.map(o => (o.id === order!.id ? { ...o, status: next } : o));
    if (next === 1) showToast("🔔 อีก 5 นาทีจะถึงเวลานัดรับ กรุณาเตรียมตัวเดินทางมายังโรงอาหาร");
    else if (next === 2) {
      secondsLeft = 0;
      if (soundOn && "vibrate" in navigator) navigator.vibrate?.([120, 60, 120]);
      showToast("🔔 อาหารของคุณเสร็จแล้ว! รหัส " + order.code);
    }
  };

  const completeOrder = () => {
    if (!order) return;
    const itemsText = order.items.map((i) => `${i.name}${i.option ? ` (${i.option})` : ""} ×${i.qty}`).join(", ");
    const firstItemName = order.items[0]?.name;
    const foundMenuItem = firstItemName ? MENU.find(m => m.name === firstItemName) : null;
    const orderStoreId = foundMenuItem?.storeId ?? inferStoreIdFromItems(itemsText);
    liveOrders = liveOrders.filter(o => o.id !== order!.id);

    const newHistory: PastOrder = {
      id: order.id,
      date: new Date(order.createdAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" }) + " · " + order.slot,
      items: itemsText, total: order.total,
      rating: submittedReview ? submittedReview.rating : 0,
      storeId: orderStoreId,
    };
    if (submittedReview) {
      const reviewId = "r" + Date.now();
      const newReview: Review = {
        id: reviewId, userId: currentUserId, userName: `${currentUserName} (${currentUserId})`,
        storeId: orderStoreId, itemId: foundMenuItem?.id, rating: submittedReview.rating,
        text: submittedReview.text || "ผู้ใช้ให้คะแนนโดยไม่มีความเห็นเพิ่มเติม",
        date: Date.now(), orderId: order.id,
      };
      reviews = [newReview, ...reviews]; newHistory.reviewId = reviewId;
    }
    historyOrders = [newHistory, ...historyOrders];
    order = null; screen = "history";
    showToast("รับอาหารเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ 🙏");
  };

  const reOrder = () => requireAuth(() => {
    if (!order) return;
    const newCart: CartItem[] = [];
    order.items.forEach((it) => {
      const found = MENU.find((m) => m.name === it.name);
      if (found) newCart.push({
        cartId: `${found.id}-${it.option || ""}-${it.note || ""}-${Date.now()}`,
        itemId: found.id, qty: Math.min(it.qty, 3),
        option: it.option || "", note: it.note || "",
      });
    });
    cart = newCart; screen = "checkout";
    showToast("เพิ่มเมนูเดิมลงตะกร้าแล้ว");
  });

  const submitReview = () => {
    if (!rating) return showToast("กรุณาเลือกจำนวนดาวก่อนส่งรีวิว");
    submittedReview = { rating, text: review };
    showToast("บันทึกรีวิวแล้ว · จะโพสต์เมื่อคุณกดรับอาหารเสร็จ ✅");
  };

  const handleEditReview = (r: Review) => { editingReview = r; };
  const handleDeleteReview = (id: string) => {
    if (confirm("ต้องการลบรีวิวนี้หรือไม่?")) {
      reviews = reviews.filter(r => r.id !== id);
      historyOrders = historyOrders.map(h => h.reviewId === id ? { ...h, reviewId: undefined, rating: 0 } : h);
      showToast("ลบรีวิวเรียบร้อยแล้ว");
    }
  };
  const handleSaveReview = (updated: Review) => {
    reviews = reviews.map(r => r.id === updated.id ? updated : r);
    historyOrders = historyOrders.map(h => h.reviewId === updated.id ? { ...h, rating: updated.rating } : h);
    editingReview = null;
    showToast("บันทึกรีวิวเรียบร้อย");
  };
  const handleReportReview = (r: Review) => { reportingReview = r; };
  const handleSubmitReport = (reason: string, details: string) => {
    if (!reportingReview) return;
    console.log(`🚩 Report submitted:`, { reviewId: reportingReview.id, reason, details, reportedUser: reportingReview.userName, timestamp: new Date().toISOString() });
    reportingReview = null;
    showToast("🚩 ส่งรายงานเรียบร้อยแล้ว ทีมงานจะตรวจสอบภายใน 24 ชม.");
  };

  const handleHistoryReviewSubmit = (ratingValue: number, text: string) => {
    const target = reviewingHistory;
    if (!target) return;
    const targetStoreId = target.storeId ?? inferStoreIdFromItems(target.items);
    const reviewId = "r" + Date.now();
    const newReview: Review = {
      id: reviewId, userId: currentUserId, userName: `${currentUserName} (${currentUserId})`,
      storeId: targetStoreId, rating: ratingValue, text,
      date: Date.now(), orderId: target.id,
    };
    reviews = [newReview, ...reviews];
    historyOrders = historyOrders.map(h => h.id === target.id ? { ...h, rating: ratingValue, reviewId, storeId: targetStoreId } : h);
    reviewingHistory = null;
    showToast("ส่งรีวิวเรียบร้อย ขอบคุณค่ะ 🙏");
  };

  onMount(() => {
    const countdownInterval = setInterval(() => {
      if (order && screen === "tracking" && order.status < 2) secondsLeft = Math.max(0, secondsLeft - 1);
    }, 1000);

    // ===== Simulation Engine: สถิติไหลขึ้น-ลงสอดคล้องกันรายร้าน =====
    const simInterval = setInterval(() => {
      if (!isOnline) return;
      const mine = liveOrders.filter(o => o.isMine);
      let sim = liveOrders.filter(o => !o.isMine);

      // 1) เลื่อนสถานะ: รับออเดอร์ → กำลังปรุง → พร้อมรับ
      sim = sim.map(o => o.status < 2 && Math.random() < 0.3 ? { ...o, status: (o.status + 1) as OrderStatus } : o);

      // 2) ออเดอร์พร้อมรับถูกรับออก (ไหลลง) แต่รักษาขั้นต่ำต่อร้าน
      const readyCount: Record<string, number> = {};
      for (const o of sim) if (o.status === 2) readyCount[o.storeIds[0]] = (readyCount[o.storeIds[0]] ?? 0) + 1;
      sim = sim.filter(o => {
        if (o.status === 2) {
          const sid = o.storeIds[0]; const c = readyCount[sid] ?? 0;
          const p = c > READY_MAX ? 0.8 : 0.35;
          if (c > READY_MIN && Math.random() < p) { readyCount[sid] = c - 1; return false; }
        }
        return true;
      });

      // 3) คุมจำนวนลูกค้ากำลังสั่งต่อร้านให้อยู่ในกรอบ 10-20
      for (const s of STORES) {
        const ofStore = sim.filter(o => o.storeIds.includes(s.id));
        const active = ofStore.filter(o => o.status < 2).length;
        if (active < ACTIVE_MIN) {
          const need = ACTIVE_MIN - active + Math.floor(Math.random() * 3);
          for (let i = 0; i < need; i++) sim = [...sim, createSimOrder(s.id, 0)];
        } else if (active > ACTIVE_MAX) {
          let excess = active - ACTIVE_MAX;
          sim = sim.filter(o => {
            if (excess > 0 && o.storeIds.includes(s.id) && o.status === 0 && Math.random() < 0.8) { excess--; return false; }
            return true;
          });
        } else if (Math.random() < 0.5) {
          const add = 1 + (Math.random() < 0.3 ? 1 : 0);
          for (let i = 0; i < add; i++) sim = [...sim, createSimOrder(s.id, 0)];
        }
      }
      liveOrders = [...mine, ...sim];
    }, SIM_TICK_MS);

    const handleOnline = () => { isOnline = true; showToast("🌐 กลับมาออนไลน์แล้ว! สามารถส่งออเดอร์ได้"); };
    const handleOffline = () => { isOnline = false; showToast("📴 คุณออฟไลน์อยู่ (ยังดูเมนู/เวลาที่เหลือได้ แต่ส่งออเดอร์ไม่ได้)"); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(simInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

<div class="min-h-screen w-full bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
  <!-- NAVBAR -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 lg:gap-3">
      <div class="flex items-center gap-2.5 min-w-0 shrink-0">
        <img src="/logo.png" alt="SPU Smart Food Queue Logo" class="h-10 w-10 object-contain rounded-xl shadow-sm shrink-0"
          onerror={(e) => { const target = e.currentTarget as HTMLImageElement; if (!target.src.endsWith('.webp')) target.src = '/logo.webp'; }} />
        <div class="min-w-0">
          <h1 class="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">SPU Smart Food Queue</h1>
          <p class="hidden 2xl:block text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[220px]">ระบบจองคิวอาหารโรงอาหารล่วงหน้า มหาวิทยาลัยศรีปทุม</p>
        </div>
      </div>
      <div class={`hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shrink-0 ${isOnline ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
        {#if isOnline}<Wifi class="w-3 h-3" /> ออนไลน์{:else}<WifiOff class="w-3 h-3" /> ออฟไลน์{/if}
      </div>
      <nav class="hidden md:flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
        {#each [{ key: "home", label: "รายการอาหาร", icon: Home }, { key: "checkout", label: "ตะกร้าสั่งซื้อ", icon: ShoppingCart, badge: count }, { key: "tracking", label: "สถานะออเดอร์", icon: Timer }, { key: "history", label: "ประวัติการสั่ง", icon: History }] as t}
          {@const active = screen === t.key}
          {@const IconComp = t.icon}
          <button onclick={() => handleNav(t.key as Screen)} class={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-lg text-[11px] lg:text-xs font-bold whitespace-nowrap transition ${active ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"}`}>
            <IconComp class="w-4 h-4 shrink-0" /><span class="whitespace-nowrap">{t.label}</span>
            {#if t.badge && t.badge > 0}<span class="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold tabnum leading-none shrink-0">{t.badge}</span>{/if}
          </button>
        {/each}
      </nav>
      <div class="flex items-center gap-2 shrink-0">
        {#if isAuthenticated}
          <div class="hidden 2xl:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl shrink-0">
            <div class="h-7 w-7 rounded-full bg-emerald-500 grid place-items-center text-white shrink-0"><UserCircle class="w-4 h-4" /></div>
            <div class="flex flex-col min-w-0">
              <span class="text-[10px] font-bold text-emerald-700 leading-tight whitespace-nowrap">{currentUserName}</span>
              <span class="text-[9px] text-emerald-500 leading-tight whitespace-nowrap">{currentUserId}</span>
            </div>
          </div>
          <button onclick={handleLogout} class="flex items-center gap-1.5 text-[11px] lg:text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl hover:bg-slate-200 transition border border-slate-200/80 whitespace-nowrap shrink-0" title="ออกจากระบบ">
            <GraduationCap class="w-4 h-4 text-emerald-600 shrink-0" />
            <span class="hidden lg:inline whitespace-nowrap">ออกจากระบบ</span>
          </button>
        {:else}
          <button onclick={() => (showLogin = true)} class="flex items-center gap-1.5 text-[11px] lg:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl hover:bg-emerald-100 transition shadow-sm whitespace-nowrap shrink-0">
            <LogIn class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline whitespace-nowrap">เข้าสู่ระบบ</span>
          </button>
        {/if}
      </div>
    </div>
  </header>

  {#if toast}
    <div transition:fly={{ y: -30, duration: 200 }} class="fixed top-20 left-1/2 -translate-x-1/2 z-[70] max-w-sm w-[90%] bg-slate-900/95 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl backdrop-blur flex items-center gap-2.5">
      <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
      <span class="leading-snug">{toast}</span>
    </div>
  {/if}

  {#if !isOnline}
    <div class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-amber-700 font-medium">
        <WifiOff class="w-4 h-4 shrink-0" />
        <span>คุณกำลังออฟไลน์อยู่ · สามารถดูเมนูและเวลาที่เหลือได้ แต่ไม่สามารถส่ง/ติดตามออเดอร์แบบ Realtime ได้</span>
      </div>
    </div>
  {/if}

  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
    <!-- HOME -->
    {#if screen === "home"}
      <div in:fade={{ duration: 150 }} class="space-y-6">
        <div class="relative max-w-xl mx-auto md:mx-0">
          <Search class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input bind:value={query} placeholder="ค้นหาเมนูอาหาร หรือชื่อร้านค้า..." class="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 shadow-sm transition" />
        </div>

        {#if !query}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <h3 class="text-xs font-extrabold text-slate-700 uppercase flex items-center gap-1.5 mb-3"><Flame class="w-4 h-4 text-orange-500" /> เมนูยอดนิยม</h3>
              <div class="space-y-2">
                {#each topMenus as m, idx (m.id)}
                  <div class="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                    <span class={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-black ${idx === 0 ? "bg-yellow-400 text-white" : idx === 1 ? "bg-slate-300 text-white" : "bg-orange-300 text-white"}`}>{idx + 1}</span>
                    <span class="text-lg">{m.emoji}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-slate-700 truncate">{m.name}</p>
                      <p class="text-[10px] text-orange-500 font-bold">🔥 {m.popularity}% นิยม</p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <h3 class="text-xs font-extrabold text-slate-700 uppercase flex items-center gap-1.5 mb-3"><Rocket class="w-4 h-4 text-purple-500" /> ร้านเปิดใหม่</h3>
              {#if newStores.length > 0}
                <div class="space-y-2">
                  {#each newStores as s (s.id)}
                    <div class="flex items-center gap-2 py-1.5">
                      <span class="text-lg">{s.emoji}</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-slate-700 truncate">{s.name}</p>
                        <p class="text-[10px] text-purple-600 font-bold">🆕 NEW</p>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="py-4 text-center"><p class="text-xs text-slate-400">ยังไม่มีร้านใหม่ตอนนี้</p></div>
              {/if}
            </div>
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <h3 class="text-xs font-extrabold text-slate-700 uppercase flex items-center gap-1.5 mb-3"><TrendingUp class="w-4 h-4 text-red-500" /> ร้านค้ามาแรง</h3>
              {#if trendingStores.length > 0}
                <div class="space-y-2">
                  {#each trendingStores as s (s.id)}
                    <div class="flex items-center gap-2 py-1.5">
                      <span class="text-lg">{s.emoji}</span>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-slate-700 truncate">{s.name}</p>
                        <p class="text-[10px] text-red-500 font-bold">⚡ Trending</p>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="py-4 text-center"><p class="text-xs text-slate-400">ยังไม่มีร้านมาแรงตอนนี้</p></div>
              {/if}
            </div>
          </div>

          <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {#each STORES as s (s.id)}
              {@const st = storeStats[s.id]}
              <button onclick={() => (activeStoreId = s.id)} class={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition ${activeStoreId === s.id ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30" : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50"}`}>
                <span class="text-2xl">{s.emoji}</span>
                <div>
                  <div class="flex items-center gap-1">
                    <p class={`text-xs sm:text-sm font-bold leading-tight whitespace-nowrap ${activeStoreId === s.id ? "text-white" : "text-slate-800"}`}>{s.name}</p>
                    {#if s.isNew}<span class="text-[8px] bg-purple-500 text-white px-1 py-0.5 rounded font-black">NEW</span>{/if}
                    {#if s.trending}<span class="text-[8px] bg-red-500 text-white px-1 py-0.5 rounded font-black">🔥</span>{/if}
                  </div>
                  <div class="flex items-center gap-1.5 mt-1">
                    <Star class={`w-3 h-3 ${activeStoreId === s.id ? "text-white fill-white" : "text-amber-400 fill-amber-400"}`} />
                    <span class={`text-[10px] font-semibold ${activeStoreId === s.id ? "text-emerald-50" : "text-slate-400"}`}>{s.rating}</span>
                    <span class={`text-[10px] font-semibold ${activeStoreId === s.id ? "text-emerald-50" : "text-slate-400"}`}>·</span>
                    <span class={`text-[10px] font-bold ${activeStoreId === s.id ? "text-white" : "text-emerald-600"}`}>⚡ {st.total} ออเดอร์สด</span>
                  </div>
                </div>
              </button>
            {/each}
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div class="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3.5">
                <div class="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur grid place-items-center text-3xl shrink-0">{activeStore.emoji}</div>
                <div>
                  <h2 class="text-lg sm:text-xl font-black">{activeStore.name}</h2>
                  <p class="text-xs sm:text-sm text-emerald-50/90 mt-0.5">{activeStore.lock} · {activeStore.location}</p>
                </div>
              </div>
              <span class="text-xs font-bold bg-white/20 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full whitespace-nowrap">เปิดให้บริการ</span>
            </div>
            <div class="grid grid-cols-3 divide-x divide-slate-100 bg-white py-3">
              <div class="flex flex-col items-center gap-0.5">
                <span class="flex items-center gap-1 text-sm sm:text-base font-extrabold text-slate-800"><Star class="w-4 h-4 text-amber-400 fill-amber-400" /> {activeStore.rating}</span>
                <span class="text-[11px] text-slate-400 font-medium">คะแนนร้าน</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="flex items-center gap-1 text-sm sm:text-base font-extrabold text-slate-800"><Clock class="w-4 h-4 text-emerald-500" /> {activeStore.cookTime}</span>
                <span class="text-[11px] text-slate-400 font-medium">เวลาปรุงเฉลี่ย</span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="flex items-center gap-1 text-sm sm:text-base font-extrabold text-slate-800"><Users class="w-4 h-4 text-orange-500" /> {storeStats[activeStoreId].active} คิว</span>
                <span class="text-[11px] text-slate-400 font-medium">กำลังสั่ง/ปรุง</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 bg-slate-50 border-t border-slate-100 px-5 py-3">
              <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5"><Users class="w-3.5 h-3.5 text-orange-500" /> ลูกค้ากำลังสั่ง: {storeStats[activeStoreId].active}</span>
              <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5"><Receipt class="w-3.5 h-3.5 text-emerald-500" /> ออเดอร์ทั้งหมด: {storeStats[activeStoreId].total}</span>
              <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5"><CheckCircle2 class="w-3.5 h-3.5 text-teal-500" /> พร้อมรับ: {storeStats[activeStoreId].ready}</span>
            </div>
          </div>
        {/if}

        <div class="flex items-center justify-between pt-2">
          <h3 class="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wide"><Sparkles class="w-4 h-4 text-emerald-500" /> {query ? "ผลการค้นหาเมนู" : `เมนูของ ${activeStore.name}`}</h3>
          <span class="text-xs text-slate-400 whitespace-nowrap">พบ {filteredMenu.length} รายการ</span>
        </div>

        {#if filteredMenu.length === 0}
          <div class="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center"><Search class="w-10 h-10 text-slate-300 mx-auto mb-3" /><p class="text-sm text-slate-400 font-medium">ไม่พบเมนูที่คุณกำลังค้นหา</p></div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredMenu as m (m.id)}
            {@const totalQty = cart.filter((c) => c.itemId === m.id).reduce((s, c) => s + c.qty, 0)}
            {@const storeOfItem = STORES.find((s) => s.id === m.storeId)!}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex gap-4 hover:shadow-md transition">
              <div class="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-slate-100 grid place-items-center text-4xl relative">
                {m.emoji}
                {#if m.tag}<span class="absolute -top-1.5 -left-1.5 text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">{m.tag}</span>{/if}
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  {#if query}<span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1"><StoreIcon class="w-2.5 h-2.5" /> {storeOfItem.name}</span>{/if}
                  <h4 class="text-sm font-bold text-slate-800 leading-snug truncate">{m.name}</h4>
                  <p class="text-xs text-slate-400 leading-snug mt-1 line-clamp-2">{m.desc}</p>
                  <div class="flex flex-wrap items-center gap-1.5 mt-2">
                    {#if m.prepTime}<span class="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1"><Clock class="w-2.5 h-2.5" /> {m.prepTime}</span>{/if}
                    {#if m.calories}<span class="text-[10px] text-orange-700 font-bold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded flex items-center gap-1"><Flame class="w-2.5 h-2.5" /> {m.calories} kcal</span>{/if}
                    {#if m.popularity}<span class="text-[10px] text-red-600 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded">🔥 {m.popularity}%</span>{/if}
                  </div>
                </div>
                <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span class="text-base font-extrabold text-emerald-600 tabnum">{m.price} <span class="text-xs font-bold text-slate-400">บาท</span></span>
                  <button onclick={() => handleAddClick(m)} class="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm shadow-emerald-500/25 transition">
                    <Plus class="w-3.5 h-3.5" strokeWidth={3} /> เพิ่ม
                    {#if totalQty > 0}<span class="bg-white text-emerald-600 rounded-full px-1.5 ml-0.5 text-[10px] font-black">{totalQty}</span>{/if}
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if !query && filteredMenu.length > 0}
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <ReviewList {reviews} currentUserId={currentUserId} onEdit={handleEditReview} onDelete={handleDeleteReview} onReport={handleReportReview} storeFilter={activeStoreId} />
          </div>
        {/if}
      </div>
    {/if}

    <!-- CHECKOUT -->
    {#if screen === "checkout"}
      <div in:fade={{ duration: 150 }} class="max-w-2xl mx-auto space-y-5">
        <div class="flex items-center gap-3">
          <button onclick={() => (screen = "home")} class="h-9 w-9 rounded-full bg-white border border-slate-200 grid place-items-center shadow-sm hover:bg-slate-50"><ArrowLeft class="w-4 h-4 text-slate-700" /></button>
          <h2 class="text-lg font-extrabold text-slate-800">ยืนยันคำสั่งซื้อของคุณ</h2>
        </div>
        {#if !isOnline}
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"><WifiOff class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" /><div><p class="text-xs font-bold text-amber-800">ออฟไลน์อยู่</p><p class="text-[11px] text-amber-700 mt-0.5">กรุณาเชื่อมต่ออินเทอร์เน็ตเพื่อยืนยันการสั่งซื้อ</p></div></div>
        {/if}
        {#if count === 0}
          <div class="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center px-6"><ShoppingCart class="w-12 h-12 text-slate-300 mx-auto mb-3" /><p class="text-base font-bold text-slate-700">ไม่มีรายการอาหารในตะกร้า</p><button onclick={() => (screen = "home")} class="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition">กลับไปเลือกเมนู</button></div>
        {:else}
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-4"><Receipt class="w-4 h-4 text-emerald-500" /> รายการที่เลือกสั่ง</h3>
            <div class="divide-y divide-slate-100 space-y-3">
              {#each cartLines as l (l.cartId)}
                <div class="flex items-start gap-3 pt-3 first:pt-0">
                  <div class="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 grid place-items-center text-xl shrink-0 mt-0.5">{l.item.emoji}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{l.item.name}</p>
                    <p class="text-xs text-emerald-600 font-medium mb-1">{l.store.name}</p>
                    <div class="flex flex-wrap gap-1 mb-1">
                      {#if l.item.prepTime}<span class="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">⏱️ {l.item.prepTime}</span>{/if}
                      {#if l.item.calories}<span class="text-[10px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">🔥 {l.item.calories} kcal</span>{/if}
                    </div>
                    {#if l.option}<span class="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded inline-block mb-1">{l.option}</span>{/if}
                    {#if l.note}<p class="text-[11px] text-slate-500 italic">โน้ต: {l.note}</p>{/if}
                    <p class="text-xs text-slate-400 mt-0.5">{l.item.price} บาท × {l.qty}</p>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <span class="text-sm font-extrabold text-slate-800 tabnum">{money(l.item.price * l.qty)}</span>
                    <div class="flex items-center gap-2">
                      <button onclick={() => decFromCart(l.cartId)} class="h-7 w-7 rounded-full bg-slate-100 text-slate-600 grid place-items-center hover:bg-slate-200 transition"><Minus class="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                      <span class="text-xs font-black text-slate-700 tabnum w-5 text-center">{l.qty}</span>
                      <button onclick={() => addFromCart(l.cartId)} disabled={l.qty >= 3} class={`h-7 w-7 rounded-full grid place-items-center transition ${l.qty >= 3 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}><Plus class="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                    </div>
                    {#if l.qty >= 3}<span class="text-[9px] text-red-500 font-bold">สูงสุด 3 ชิ้น</span>{/if}
                  </div>
                </div>
              {/each}
            </div>
            <div class="mt-4 pt-4 border-t border-dashed border-slate-200 space-y-2">
              <div class="flex justify-between text-xs text-slate-500"><span>ยอดรวมค่าอาหาร</span><span class="tabnum font-semibold text-slate-700">{money(subtotal)}</span></div>
              <div class="flex justify-between items-end pt-2 border-t border-slate-100"><span class="text-sm font-bold text-slate-800">ยอดชำระสุทธิ</span><span class="text-2xl font-black text-emerald-600 tabnum leading-none">{money(total)}</span></div>
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3"><Timer class="w-4 h-4 text-emerald-500" /> เวลานัดรับอาหาร (Time Slot)</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {#each SLOTS as s}<button onclick={() => (slot = s)} class={`h-11 rounded-xl text-xs font-bold transition border tabnum active:scale-95 whitespace-nowrap ${slot === s ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300"}`}>{s}</button>{/each}
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3"><MessageSquare class="w-4 h-4 text-emerald-500" /> หมายเหตุเพิ่มเติม</h3>
            <div class="relative"><PenLine class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" /><input bind:value={orderNote} placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย..." class="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50" /></div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-3"><QrCode class="w-4 h-4 text-emerald-500" /> ช่องทางชำระเงิน</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <button onclick={() => (payMethod = "promptpay")} class={`h-12 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition whitespace-nowrap ${payMethod === "promptpay" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200"}`}><QrCode class="w-4 h-4" /> QR PromptPay</button>
              <button onclick={() => (payMethod = "banking")} class={`h-12 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition whitespace-nowrap ${payMethod === "banking" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200"}`}><Smartphone class="w-4 h-4" /> Mobile Banking</button>
            </div>
            {#if payMethod === "promptpay"}
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center"><div class="bg-white rounded-2xl p-3 shadow-sm max-w-[220px] w-full flex justify-center"><img src="/qrcode.webp" alt="QR" class="w-full h-auto object-contain rounded-xl" /></div><p class="text-xl font-black text-emerald-600 tabnum mt-3">{money(total)}</p></div>
            {:else}
              <div class="rounded-2xl bg-slate-50 p-3 space-y-2">
                {#if !selectedBank}<p class="text-[10px] font-bold text-slate-400 px-1 pb-0.5">แตะเพื่อเลือกธนาคารที่ต้องการชำระเงิน</p>{/if}
                {#each BANKS as b (b.id)}
                  {@const selected = selectedBank === b.id}
                  <button onclick={() => selectBank(b)} class={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 border text-left transition ${selected ? "bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20" : "bg-white border-slate-100 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-[0.99]"}`} aria-pressed={selected}>
                    <span class="flex items-center gap-2.5 min-w-0">
                      <span class={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${selected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>{#if selected}<CheckCircle2 class="w-4 h-4" />{:else}<Smartphone class="w-4 h-4" />{/if}</span>
                      <span class="min-w-0"><span class={`block text-xs font-semibold truncate ${selected ? "text-emerald-700" : "text-slate-700"}`}>{b.name}</span><span class="block text-[10px] text-slate-400">{b.app}</span></span>
                    </span>
                    <ChevronRight class={`w-4 h-4 shrink-0 ${selected ? "text-emerald-500" : "text-slate-400"}`} />
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <button onclick={confirmOrder} disabled={paying || !isOnline || (payMethod === "banking" && !selectedBank)} class="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white shadow-xl shadow-emerald-500/30 disabled:bg-slate-200 disabled:text-slate-400">
            {#if paying}<Loader2 class="w-5 h-5 animate-spin" /> กำลังดำเนินการ...
            {:else if !isOnline}<WifiOff class="w-5 h-5" /> ออฟไลน์ - ไม่สามารถสั่งซื้อได้
            {:else if payMethod === "banking" && !selectedBank}<Smartphone class="w-5 h-5" /> กรุณาเลือกธนาคารด้านบน
            {:else if payMethod === "banking" && selectedBankObj}ยืนยันการสั่งซื้อผ่าน {selectedBankObj.app} · {money(total)}
            {:else}ยืนยันการสั่งซื้อ · {money(total)}
            {/if}
          </button>
        {/if}
      </div>
    {/if}

    <!-- TRACKING -->
    {#if screen === "tracking"}
      <div in:fade={{ duration: 150 }} class="max-w-2xl mx-auto space-y-5">
        {#if !order}
          <div class="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center px-6"><Timer class="w-12 h-12 text-slate-300 mx-auto mb-3" /><p class="text-base font-bold text-slate-700">ยังไม่มีออเดอร์ที่กำลังดำเนินการ</p><button onclick={() => (screen = "home")} class="mt-4 bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl">เริ่มสั่งอาหาร</button></div>
        {:else}
          {#if !isOnline}<div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"><WifiOff class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" /><div><p class="text-xs font-bold text-amber-800">ออฟไลน์อยู่</p><p class="text-[11px] text-amber-700 mt-0.5">ไม่สามารถอัปเดตสถานะแบบ Realtime ได้ เวลานับถอยหลังเป็นการประมาณการ</p></div></div>{/if}
          {#if order.status === 2}<div transition:slide class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-5 shadow-lg flex items-start gap-3"><Bell class="w-5 h-5 shrink-0 mt-0.5" /><div><p class="text-sm font-black">🔔 อาหารพร้อมรับแล้ว!</p><p class="text-xs text-emerald-50 mt-0.5">รหัส {order.code} - รับที่ช่องบริการด่วน 2</p></div></div>{/if}

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
            <div class="flex items-center justify-between">
              <div><p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">หมายเลขคำสั่งซื้อ</p><span class="text-base font-black text-slate-800 tabnum">{order.id}</span></div>
              <span class={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${order.status === 2 ? "bg-emerald-100 text-emerald-700" : order.status === 1 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{order.status === 0 ? "รับออเดอร์แล้ว" : order.status === 1 ? "กำลังปรุง" : "พร้อมรับ"}</span>
            </div>
            <div class="mt-4 rounded-3xl bg-slate-900 p-6 text-center text-white shadow-inner"><p class="text-xs text-slate-400 font-semibold">รหัสรับอาหาร</p><p class="text-5xl sm:text-6xl font-black text-emerald-400 leading-none tracking-tight tabnum mt-2">{order.code}</p></div>
            <div class="mt-4 divide-y divide-slate-100">
              <div class="py-2 space-y-1">{#each order.items as i}<div class="text-xs text-slate-700 font-medium"><span class="text-slate-400">[{i.storeName}]</span> {i.name} ×{i.qty} {#if i.option}<span class="text-amber-600 ml-1">({i.option})</span>{/if}</div>{/each}</div>
              <div class="pt-2 flex justify-between text-xs text-slate-500"><span>เวลานัดรับ</span><span class="font-bold text-emerald-600 tabnum">{order.slot}</span></div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              {#each myOrderStoreIds as sid}
                {@const st = storeStats[sid]}
                {@const stName = STORES.find(s => s.id === sid)?.name ?? sid}
                <span class="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-slate-600 whitespace-nowrap">{stName}: กำลังสั่ง {st.active} · พร้อมรับ {st.ready}</span>
              {/each}
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase mb-4"><Zap class="w-4 h-4 text-emerald-500" /> สถานะคิว {#if !isOnline}<span class="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">(ประมาณการ)</span>{/if}</h3>
            <div class="relative flex justify-between my-4">
              <div class="absolute left-[16.6%] right-[16.6%] top-5 h-1 bg-slate-100 rounded-full"></div>
              <div class="absolute left-[16.6%] top-5 h-1 bg-emerald-500 rounded-full transition-all" style={`width: ${(order.status / 2) * 66.8}%`}></div>
              <div class="flex flex-col items-center gap-2 z-10 w-1/3"><div class={`h-11 w-11 rounded-full grid place-items-center border-2 transition ${order.status >= 0 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-300"}`}><Receipt class="w-5 h-5" /></div><span class={`text-xs font-bold whitespace-nowrap ${order.status >= 0 ? "text-emerald-700" : "text-slate-400"}`}>รับออเดอร์</span></div>
              <div class="flex flex-col items-center gap-2 z-10 w-1/3"><div class={`h-11 w-11 rounded-full grid place-items-center border-2 transition ${order.status >= 1 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-300"}`}><ChefHat class="w-5 h-5" /></div><span class={`text-xs font-bold whitespace-nowrap ${order.status >= 1 ? "text-emerald-700" : "text-slate-400"}`}>กำลังปรุง</span></div>
              <div class="flex flex-col items-center gap-2 z-10 w-1/3"><div class={`h-11 w-11 rounded-full grid place-items-center border-2 transition ${order.status >= 2 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-300"}`}><CheckCircle2 class="w-5 h-5" /></div><span class={`text-xs font-bold whitespace-nowrap ${order.status >= 2 ? "text-emerald-700" : "text-slate-400"}`}>พร้อมรับ</span></div>
            </div>
            <button onclick={advanceStatus} disabled={order.status === 2 || !isOnline} class={`mt-2 w-full h-10 rounded-xl border-2 border-dashed text-xs font-bold transition whitespace-nowrap ${order.status === 2 || !isOnline ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"}`}><Zap class="w-3.5 h-3.5 inline mr-1" /> {!isOnline ? "ออฟไลน์ - ไม่สามารถอัปเดตได้" : order.status === 2 ? "เสร็จสมบูรณ์" : "[Simulate] จำลองสถานะถัดไป"}</button>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase mb-3"><Timer class="w-4 h-4 text-emerald-500" /> เวลานับถอยหลัง {#if !isOnline}<span class="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">(ประมาณการ)</span>{/if}</h3>
            <div class="rounded-2xl bg-slate-900 py-4 text-center"><p class="text-4xl font-black text-emerald-400 tabnum tracking-widest">{fmtCountdown(secondsLeft)}</p></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button onclick={reOrder} class="h-12 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 whitespace-nowrap"><Repeat class="w-4 h-4 text-emerald-600" /> สั่งอีกครั้ง</button>
            <button onclick={() => (receiptOpen = true)} class="h-12 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 whitespace-nowrap"><Receipt class="w-4 h-4 text-emerald-600" /> ใบเสร็จ</button>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase mb-3"><Star class="w-4 h-4 text-amber-400" /> ให้คะแนนความพึงพอใจ</h3>
            {#if submittedReview}
              <div class="text-center py-3"><div class="flex justify-center gap-1.5 mb-2">{#each [1, 2, 3, 4, 5] as n}<Star class={`w-6 h-6 ${n <= submittedReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />{/each}</div><p class="text-xs font-bold text-emerald-600">บันทึกรีวิวแล้ว · จะโพสต์เมื่อรับอาหารเสร็จ ✅</p></div>
            {:else}
              <div class="flex justify-center gap-3 mb-4">{#each [1, 2, 3, 4, 5] as n}<button onclick={() => (rating = n)} class="p-1 active:scale-90 transition"><Star class={`w-9 h-9 transition-colors ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} /></button>{/each}</div>
              <textarea bind:value={review} rows={2} placeholder="เขียนรีวิว..." class="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none"></textarea>
              <button onclick={submitReview} class={`mt-3 w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${rating ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-100 text-slate-400"}`}><BadgeCheck class="w-4 h-4" /> ส่งรีวิว</button>
            {/if}
          </div>

          {#if order.status === 2}<button onclick={completeOrder} class="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-xl"><CheckCircle2 class="w-5 h-5" /> ได้รับอาหารเรียบร้อยแล้ว</button>{/if}
        {/if}
      </div>
    {/if}

    <!-- HISTORY -->
    {#if screen === "history"}
      <div in:fade={{ duration: 150 }} class="max-w-2xl mx-auto space-y-4">
        <h2 class="text-lg font-extrabold text-slate-800">ประวัติคำสั่งซื้อทั้งหมด</h2>
        {#if historyOrders.length === 0}<div class="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center px-6"><History class="w-12 h-12 text-slate-300 mx-auto mb-3" /><p class="text-base font-bold text-slate-700">ยังไม่มีประวัติการสั่งซื้อ</p><button onclick={() => (screen = "home")} class="mt-4 bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl">เริ่มสั่งอาหาร</button></div>{/if}
        <div class="space-y-3">
          {#each historyOrders as o (o.id)}
            {@const linkedReview = reviews.find(r => r.id === o.reviewId)}
            {@const orderStore = STORES.find(s => s.id === o.storeId)}
            <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5">
              <div class="flex items-start justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-800 tabnum">{o.id}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{o.date}</p>
                  {#if orderStore}<span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1.5"><StoreIcon class="w-2.5 h-2.5" /> {orderStore.emoji} {orderStore.name}</span>{/if}
                </div>
                <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full whitespace-nowrap shrink-0">เสร็จสิ้น</span>
              </div>
              <p class="text-xs text-slate-600 mt-2.5">{o.items}</p>
              {#if linkedReview}
                <div class="mt-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
                  <div class="flex items-center gap-1.5 mb-1"><div class="flex gap-0.5">{#each [1, 2, 3, 4, 5] as n}<Star class={`w-3.5 h-3.5 ${n <= linkedReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />{/each}</div><span class="text-[10px] font-bold text-emerald-600">รีวิวของฉัน</span></div>
                  <p class="text-[11px] text-emerald-900 leading-relaxed italic">💬 "{linkedReview.text}"</p>
                </div>
              {:else}
                <button onclick={() => (reviewingHistory = o)} class="mt-3 w-full h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition"><PenLine class="w-3.5 h-3.5" /> เขียนรีวิวสำหรับออเดอร์นี้</button>
              {/if}
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div class="flex gap-1">{#each [1, 2, 3, 4, 5] as n}<Star class={`w-4 h-4 ${n <= o.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />{/each}</div>
                <span class="text-base font-black text-emerald-600 tabnum">{money(o.total)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </main>

  {#if screen === "home" && count > 0}
    <div transition:fly={{ y: 90, duration: 200 }} class="md:hidden fixed left-4 right-4 bottom-20 z-30">
      <div class="bg-slate-900 rounded-2xl p-3 shadow-2xl flex items-center justify-between border border-slate-800">
        <div class="flex items-center gap-3">
          <div class="relative h-10 w-10 rounded-xl bg-emerald-500 grid place-items-center text-white"><ShoppingCart class="w-5 h-5" /><span class="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-white text-slate-900 text-[10px] font-black grid place-items-center">{count}</span></div>
          <div><p class="text-[11px] text-slate-400">สั่งรวม {count} รายการ</p><p class="text-base font-extrabold text-white tabnum mt-1">{money(total)}</p></div>
        </div>
        <button onclick={() => requireAuth(() => (screen = "checkout"))} class="bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap">ชำระเงิน <ChevronRight class="w-4 h-4" strokeWidth={3} /></button>
      </div>
    </div>
  {/if}

  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 py-2 px-3">
    <div class="flex items-center justify-around">
      {#each [{ key: "home", label: "เมนูอาหาร", icon: Home }, { key: "checkout", label: "ตะกร้า", icon: ShoppingCart, badge: count }, { key: "tracking", label: "สถานะ", icon: Timer }, { key: "history", label: "ประวัติ", icon: History }] as t}
        {@const active = screen === t.key}
        {@const IconComp = t.icon}
        <button onclick={() => handleNav(t.key as Screen)} class="relative flex flex-col items-center gap-1 py-1 px-3">
          <span class={`relative transition-colors ${active ? "text-emerald-600" : "text-slate-400"}`}><IconComp class="w-5 h-5" />{#if t.badge && t.badge > 0}<span class="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-black grid place-items-center">{t.badge}</span>{/if}</span>
          <span class={`text-[10px] font-bold whitespace-nowrap ${active ? "text-emerald-600" : "text-slate-500"}`}>{t.label}</span>
        </button>
      {/each}
    </div>
  </nav>

  <div class="fixed right-4 bottom-24 md:bottom-6 z-40 flex flex-col items-end gap-2">
    {#if demoOpen}
      <div transition:fly={{ y: 12, duration: 150 }} class="bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl w-48 border border-slate-700 text-white">
        <p class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-2">Demo Controls</p>
        <div class="grid grid-cols-2 gap-1.5">{#each ["home", "checkout", "tracking", "history"] as k}<button onclick={() => { handleNav(k as Screen); demoOpen = false; }} class={`h-8 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${screen === k ? "bg-emerald-500" : "bg-white/10 hover:bg-white/20"}`}>{k}</button>{/each}</div>
      </div>
    {/if}
    <button onclick={() => (demoOpen = !demoOpen)} class="h-11 w-11 rounded-full bg-slate-900 text-emerald-400 shadow-xl grid place-items-center border border-slate-700 hover:scale-105 transition">{#if demoOpen}<X class="w-5 h-5" />{:else}<Zap class="w-5 h-5" />{/if}</button>
  </div>

  <!-- MODALS -->
  {#if optionModalItem}<OptionModal item={optionModalItem} onClose={() => (optionModalItem = null)} onAdd={(opt, note) => { addItemToCart(optionModalItem!, opt, note); showToast(`เพิ่ม ${optionModalItem!.name} ลงตะกร้าแล้ว`); }} />{/if}
  {#if showLogin}<LoginModal loading={loginLoading} lastLogin={lastLoginMethod} onClose={() => (showLogin = false)} onLogin={(method) => executeLoginSuccess(method)} />{/if}
  {#if receiptOpen && order}<ReceiptModal {order} onClose={() => (receiptOpen = false)} />{/if}
  {#if editingReview}<EditReviewModal review={editingReview} onClose={() => (editingReview = null)} onSave={handleSaveReview} />{/if}
  {#if reportingReview}<ReportModal review={reportingReview} onClose={() => (reportingReview = null)} onSubmit={handleSubmitReport} />{/if}
  {#if reviewModalData}<ReviewModal orderSummary={reviewModalData.order.items} storeName={reviewModalData.store?.name ?? "ไม่ทราบร้าน"} storeEmoji={reviewModalData.store?.emoji ?? "🏪"} onClose={() => (reviewingHistory = null)} onSubmit={handleHistoryReviewSubmit} />{/if}
</div>