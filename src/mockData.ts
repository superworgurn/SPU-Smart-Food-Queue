import type { Store, MenuItem, PastOrder } from './types';

export const STORES: Store[] = [
  { id: "s1", name: "ร้านข้าวแกงป้าศรี", lock: "ล็อคอาหาร 11", rating: 4.8, cookTime: "~8-10 นาที", queue: 3, location: "อาคารโรงอาหาร SPU · ชั้น 1", emoji: "🍛" },
  { id: "s2", name: "ก๋วยเตี๋ยวเรือลุงหนวด", lock: "ล็อคอาหาร 5", rating: 4.6, cookTime: "~5-7 นาที", queue: 1, location: "อาคารโรงอาหาร SPU · ชั้น 1", emoji: "🍜" },
  { id: "s3", name: "ชานมไข่มุกพี่จอย", lock: "ล็อคอาหาร 9", rating: 4.9, cookTime: "~3-5 นาที", queue: 5, location: "อาคารโรงอาหาร SPU · ชั้น 2", emoji: "🧋" },
];

export const MENU: MenuItem[] = [
  { id: "m1", storeId: "s1", name: "ข้าวราดแกง 2 อย่าง", price: 45, desc: "เลือกแกงได้ 2 อย่าง พร้อมข้าวสวยร้อน ๆ ปรุงสดใหม่ทุกวัน", emoji: "🍛", tag: "ขายดี" },
  { id: "m2", storeId: "s1", name: "ข้าวกะเพราหมูกรอบ + ไข่ดาว", price: 55, desc: "กะเพราหมูกรอบผัดแห้ง เผ็ดกำลังดี เสิร์ฟพร้อมไข่ดาวไม่สุก", emoji: "🍳", tag: "แนะนำ", optionsType: "spicy" },
  { id: "m3", storeId: "s1", name: "น้ำส้มคั้นสด", price: 25, desc: "คั้นสดใหม่ ไม่ใส่น้ำตาล เพิ่มความสดชื่นระหว่างเรียน", emoji: "🍊" },
  { id: "m4", storeId: "s2", name: "ก๋วยเตี๋ยวเรือน้ำตก (หมู/เนื้อ)", price: 50, desc: "น้ำซุปเข้มข้น ใส่ผักบุ้ง ลูกชิ้นเต็มคำ", emoji: "🍜", tag: "ขายดี" },
  { id: "m5", storeId: "s2", name: "เกาเหลาหมูตุ๋น", price: 60, desc: "หมูตุ๋นนุ่ม ๆ น้ำซุปหอมเครื่องเทศ", emoji: "🥣" },
  { id: "m6", storeId: "s2", name: "ก๋วยเตี๋ยวเรือน้ำใส", price: 50, desc: "น้ำซุปใสรสกลมกล่อม ใส่ถั่วงอก ผักชี", emoji: "🍲" },
  { id: "m7", storeId: "s3", name: "ชานมไข่มุกไต้หวัน", price: 45, desc: "ชานมเข้มข้น ไข่มุกหนึบหนับ หวานมันกำลังดี", emoji: "🧋", tag: "แนะนำ", optionsType: "sweet" },
  { id: "m8", storeId: "s3", name: "มัทฉะลาเต้", price: 50, desc: "มัทฉะแท้จากญี่ปุ่น หอมละมุน ผสมนมสด", emoji: "🍵", optionsType: "sweet" },
  { id: "m9", storeId: "s3", name: "โกโก้ปั่น", price: 55, desc: "โกโก้เข้มข้น ปั่นจนเนียน ท็อปด้วยวิปครีม", emoji: "🥤", optionsType: "sweet" },
];

export const SLOTS = ["11:45 น.", "12:00 น.", "12:15 น.", "12:30 น."];

export const INITIAL_PAST_ORDERS: PastOrder[] = [
  { id: "#SPU-8710", date: "12 มี.ค. 2568 · 12:15 น.", items: "ข้าวกะเพราหมูกรอบ + ไข่ดาว ×1", total: 55, rating: 5 },
  { id: "#SPU-8622", date: "10 มี.ค. 2568 · 11:45 น.", items: "ข้าวราดแกง 2 อย่าง ×1, ชานมไข่มุกไต้หวัน ×1", total: 90, rating: 4 },
];