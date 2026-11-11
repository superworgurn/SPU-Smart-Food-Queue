import type { Store, MenuItem, PastOrder, Review } from './types';

export const STORES: Store[] = [
  { 
    id: "s1", name: "ร้านข้าวแกงป้าศรี", lock: "ล็อคอาหาร 11", rating: 4.8, 
    cookTime: "~8-10 นาที", queue: 3, location: "อาคารโรงอาหาร SPU · ชั้น 1", emoji: "🍛",
    popularity: 95, isNew: false, trending: true
  },
  { 
    id: "s2", name: "ก๋วยเตี๋ยวเรือลุงหนวด", lock: "ล็อคอาหาร 5", rating: 4.6, 
    cookTime: "~5-7 นาที", queue: 1, location: "อาคารโรงอาหาร SPU · ชั้น 1", emoji: "🍜",
    popularity: 80, isNew: true, trending: false
  },
  { 
    id: "s3", name: "ชานมไข่มุกพี่จอย", lock: "ล็อคอาหาร 9", rating: 4.9, 
    cookTime: "~3-5 นาที", queue: 5, location: "อาคารโรงอาหาร SPU · ชั้น 2", emoji: "🧋",
    popularity: 99, isNew: false, trending: true
  },
  { 
    id: "s4", name: "ครัวคุณกุ้ง", lock: "ล็อคอาหาร 3", rating: 4.7, 
    cookTime: "~10-12 นาที", queue: 2, location: "อาคารโรงอาหาร SPU · ชั้น 1", emoji: "🥘",
    popularity: 70, isNew: true, trending: false
  },
  {
    id: "s5", name: "ส้มตำป้าแจ๋ว", lock: "ล็อคอาหาร 7", rating: 4.7,
    cookTime: "~7-9 นาที", queue: 4, location: "อาคารโรงอาหาร SPU · ชั้น 1", emoji: "🥗",
    popularity: 88, isNew: false, trending: true
  },
  {
    id: "s6", name: "ข้าวมันไก่เฮียหมู", lock: "ล็อคอาหาร 2", rating: 4.8,
    cookTime: "~4-6 นาที", queue: 6, location: "อาคารโรงอาหาร SPU · ชั้น 1", emoji: "🍗",
    popularity: 92, isNew: true, trending: true
  },
  {
    id: "s7", name: "ขนมจีนน้ำยาใต้", lock: "ล็อคอาหาร 8", rating: 4.5,
    cookTime: "~5-8 นาที", queue: 2, location: "อาคารโรงอาหาร SPU · ชั้น 2", emoji: "🍝",
    popularity: 78, isNew: false, trending: false
  },
  {
    id: "s8", name: "ผลไม้ปั่นน้องมิ้นท์", lock: "ล็อคอาหาร 12", rating: 4.9,
    cookTime: "~3-4 นาที", queue: 3, location: "อาคารโรงอาหาร SPU · ชั้น 2", emoji: "🥤",
    popularity: 90, isNew: true, trending: true
  },
];

export const MENU: MenuItem[] = [
  { 
    id: "m1", storeId: "s1", name: "ข้าวราดแกง 2 อย่าง", price: 45, 
    desc: "เลือกแกงได้ 2 อย่าง พร้อมข้าวสวยร้อน ๆ ปรุงสดใหม่ทุกวัน", 
    emoji: "🍛", tag: "ขายดี", prepTime: "8 นาที", calories: 550, popularity: 95 
  },
  { 
    id: "m2", storeId: "s1", name: "ข้าวกะเพราหมูกรอบ + ไข่ดาว", price: 55, 
    desc: "กะเพราหมูกรอบผัดแห้ง เผ็ดกำลังดี เสิร์ฟพร้อมไข่ดาวไม่สุก", 
    emoji: "🍳", tag: "แนะนำ", optionsType: "spicy", prepTime: "6 นาที", calories: 680, popularity: 88 
  },
  { 
    id: "m3", storeId: "s1", name: "น้ำส้มคั้นสด", price: 25, 
    desc: "คั้นสดใหม่ ไม่ใส่น้ำตาล เพิ่มความสดชื่นระหว่างเรียน", 
    emoji: "🍊", prepTime: "2 นาที", calories: 90, popularity: 65 
  },
  {
    id: "m11", storeId: "s1", name: "ข้าวผัดพริกแกงหมู", price: 50,
    desc: "ข้าวผัดพริกแกงรสจัดจ้าน ใส่หมูสับและถั่วฝักยาว",
    emoji: "🍚", optionsType: "spicy", prepTime: "7 นาที", calories: 620, popularity: 82
  },
  {
    id: "m12", storeId: "s1", name: "ข้าวไข่เจียวหมูสับ", price: 40,
    desc: "ไข่เจียวฟู ใส่หมูสับ เสิร์ฟพร้อมข้าวสวยร้อน ๆ",
    emoji: "🍳", prepTime: "5 นาที", calories: 520, popularity: 78
  },
  { 
    id: "m4", storeId: "s2", name: "ก๋วยเตี๋ยวเรือน้ำตก (หมู/เนื้อ)", price: 50, 
    desc: "น้ำซุปเข้มข้น ใส่ผักบุ้ง ลูกชิ้นเต็มคำ", 
    emoji: "🍜", tag: "ขายดี", prepTime: "7 นาที", calories: 420, popularity: 92 
  },
  { 
    id: "m5", storeId: "s2", name: "เกาเหลาหมูตุ๋น", price: 60, 
    desc: "หมูตุ๋นนุ่ม ๆ น้ำซุปหอมเครื่องเทศ", 
    emoji: "🥣", prepTime: "5 นาที", calories: 350, popularity: 70 
  },
  { 
    id: "m6", storeId: "s2", name: "ก๋วยเตี๋ยวเรือน้ำใส", price: 50, 
    desc: "น้ำซุปใสรสกลมกล่อม ใส่ถั่วงอก ผักชี", 
    emoji: "🍲", prepTime: "6 นาที", calories: 380, popularity: 60 
  },
  {
    id: "m13", storeId: "s2", name: "เส้นหมี่ลูกชิ้นปลา", price: 45,
    desc: "เส้นหมี่ขาว ลูกชิ้นปลาแท้ น้ำซุปปลาเข้มข้น",
    emoji: "🍜", prepTime: "6 นาที", calories: 360, popularity: 75
  },
  {
    id: "m14", storeId: "s2", name: "บะหมี่แห้งหมูแดง", price: 50,
    desc: "บะหมี่เหลืองคลุกซอส หมูแดงหวานนุ่ม โรยต้นหอมเจียว",
    emoji: "🍝", prepTime: "5 นาที", calories: 480, popularity: 80
  },
  { 
    id: "m7", storeId: "s3", name: "ชานมไข่มุกไต้หวัน", price: 45, 
    desc: "ชานมเข้มข้น ไข่มุกหนึบหนับ หวานมันกำลังดี", 
    emoji: "🧋", tag: "แนะนำ", optionsType: "sweet", prepTime: "4 นาที", calories: 380, popularity: 99 
  },
  { 
    id: "m8", storeId: "s3", name: "มัทฉะลาเต้", price: 50, 
    desc: "มัทฉะแท้จากญี่ปุ่น หอมละมุน ผสมนมสด", 
    emoji: "🍵", optionsType: "sweet", prepTime: "3 นาที", calories: 280, popularity: 75 
  },
  { 
    id: "m9", storeId: "s3", name: "โกโก้ปั่น", price: 55, 
    desc: "โกโก้เข้มข้น ปั่นจนเนียน ท็อปด้วยวิปครีม", 
    emoji: "🥤", optionsType: "sweet", prepTime: "4 นาที", calories: 450, popularity: 85 
  },
  {
    id: "m15", storeId: "s3", name: "ชาไทยเย็น", price: 35,
    desc: "ชาไทยรสเข้มข้น หวานมันนมข้น นมสดเย็นเจี๊ยบ",
    emoji: "🥛", optionsType: "sweet", prepTime: "3 นาที", calories: 320, popularity: 90
  },
  {
    id: "m16", storeId: "s3", name: "น้ำเขียวมะนาวโซดา", price: 40,
    desc: "น้ำเขียวผสมมะนาวสด โซดาซ่า สดชื่นดับร้อน",
    emoji: "🥤", prepTime: "2 นาที", calories: 180, popularity: 82
  },
  { 
    id: "m10", storeId: "s4", name: "ข้าวผัดหมู", price: 55, 
    desc: "ข้าวผัดหมูใส่ไข่ รสชาติต้นตำรับ", 
    emoji: "🍱", prepTime: "10 นาที", calories: 620, popularity: 72 
  },
  {
    id: "m17", storeId: "s4", name: "ผัดซีอิ๊วเส้นใหญ่", price: 50,
    desc: "ผัดซีอิ๊วเส้นใหญ่ ไข่ ผักคะน้า หอมกระทะ",
    emoji: "🍜", prepTime: "8 นาที", calories: 540, popularity: 80
  },
  {
    id: "m18", storeId: "s4", name: "ข้าวคลุกกะปิ", price: 60,
    desc: "ข้าวคลุกกะปิ เสิร์ฟพร้อมหมูหวาน กุ้งแห้ง ไข่เจียว",
    emoji: "🍱", tag: "แนะนำ", prepTime: "12 นาที", calories: 580, popularity: 88
  },
  {
    id: "m19", storeId: "s5", name: "ส้มตำไทย", price: 50,
    desc: "ส้มตำรสจัดจ้าน มะละกอสดกรอบ ใส่กุ้งแห้ง ถั่วลิสง",
    emoji: "🥗", tag: "ขายดี", optionsType: "spicy", prepTime: "7 นาที", calories: 220, popularity: 94
  },
  {
    id: "m20", storeId: "s5", name: "ส้มตำปูปลาร้า", price: 60,
    desc: "ส้มตำปูเค็มผสมปลาร้า รสเข้มข้นสไตล์อีสาน",
    emoji: "🦀", optionsType: "spicy", prepTime: "8 นาที", calories: 250, popularity: 86
  },
  {
    id: "m21", storeId: "s5", name: "คอหมูย่าง + ข้าวเหนียว", price: 70,
    desc: "คอหมูย่างนุ่ม หอมเครื่องเทศย่าง เสิร์ฟพร้อมน้ำจิ้มแจ่วและข้าวเหนียวร้อน",
    emoji: "🥩", tag: "แนะนำ", prepTime: "10 นาที", calories: 580, popularity: 91
  },
  {
    id: "m22", storeId: "s5", name: "ลาบหมู + ข้าวเหนียว", price: 65,
    desc: "ลาบหมูรสเด็ด ใส่ผักชีฝรั่ง หอมแดง ข้าวคั่ว",
    emoji: "🌶️", optionsType: "spicy", prepTime: "8 นาที", calories: 420, popularity: 84
  },
  {
    id: "m23", storeId: "s5", name: "ไก่ย่างเขาสวนกวาง", price: 75,
    desc: "ไก่ย่างหมักสูตรพิเศษ เนื้อนุ่ม หอมสมุนไพร",
    emoji: "🍗", prepTime: "12 นาที", calories: 520, popularity: 88
  },
  {
    id: "m24", storeId: "s6", name: "ข้าวมันไก่ธรรมดา", price: 45,
    desc: "ข้าวมันหอม ไก่ต้มเนื้อนุ่ม น้ำจิ้มสูตรเด็ด",
    emoji: "🍗", tag: "ขายดี", prepTime: "5 นาที", calories: 520, popularity: 96
  },
  {
    id: "m25", storeId: "s6", name: "ข้าวมันไก่ทอด", price: 55,
    desc: "ข้าวมันไก่ทอดกรอบนอกนุ่มใน เสิร์ฟพร้อมน้ำจิ้มหวาน",
    emoji: "🍗", tag: "แนะนำ", prepTime: "6 นาที", calories: 680, popularity: 93
  },
  {
    id: "m26", storeId: "s6", name: "ข้าวมันไก่พิเศษ (สะโพก+อก)", price: 65,
    desc: "ข้าวมันไก่ 2 ชิ้นใหญ่ ทั้งสะโพกและอกไก่ พร้อมน้ำซุปร้อน",
    emoji: "🍱", prepTime: "6 นาที", calories: 780, popularity: 88
  },
  {
    id: "m27", storeId: "s6", name: "ข้าวขาหมู", price: 55,
    desc: "ขาหมูตุ๋นจนเปื่อยนุ่ม ราดน้ำซอสสูตรพิเศษ",
    emoji: "🍖", prepTime: "5 นาที", calories: 720, popularity: 82
  },
  {
    id: "m28", storeId: "s6", name: "น้ำซุปไก่ร้อน", price: 15,
    desc: "น้ำซุปไก่ร้อน ๆ ซดแก้เลี่ยน หอมเครื่องเทศ",
    emoji: "🍵", prepTime: "1 นาที", calories: 50, popularity: 60
  },
  {
    id: "m29", storeId: "s7", name: "ขนมจีนน้ำยากะทิ", price: 45,
    desc: "ขนมจีนน้ำยากะทิเข้มข้น ใส่ผักสดหลากหลาย",
    emoji: "🍝", tag: "ขายดี", prepTime: "6 นาที", calories: 480, popularity: 85
  },
  {
    id: "m30", storeId: "s7", name: "ขนมจีนน้ำยาป่า", price: 45,
    desc: "น้ำยาป่ารสจัดจ้าน สไตล์ใต้แท้ เผ็ดร้อนถึงใจ",
    emoji: "🌶️", optionsType: "spicy", prepTime: "6 นาที", calories: 420, popularity: 78
  },
  {
    id: "m31", storeId: "s7", name: "ขนมจีนน้ำพริก", price: 40,
    desc: "ขนมจีนน้ำพริกหวานมัน หอมถั่วลิสงคั่ว",
    emoji: "🥜", prepTime: "5 นาที", calories: 450, popularity: 72
  },
  {
    id: "m32", storeId: "s7", name: "ขนมจีนแกงเขียวหวานไก่", price: 55,
    desc: "ขนมจีนราดแกงเขียวหวานไก่เข้มข้น ใส่ใบโหระพา",
    emoji: "🍛", optionsType: "spicy", prepTime: "7 นาที", calories: 520, popularity: 80
  },
  {
    id: "m33", storeId: "s7", name: "ห่อหมกปลา", price: 30,
    desc: "ห่อหมกปลานึ่งใบยอ รสเข้มข้น หอมเครื่องแกง",
    emoji: "🍃", prepTime: "8 นาที", calories: 220, popularity: 68
  },
  {
    id: "m34", storeId: "s8", name: "แตงโมปั่น", price: 35,
    desc: "แตงโมสดปั่นเย็นฉ่ำ ดับร้อนได้ดีที่สุด",
    emoji: "🍉", tag: "ขายดี", prepTime: "3 นาที", calories: 150, popularity: 92
  },
  {
    id: "m35", storeId: "s8", name: "มะม่วงปั่นโยเกิร์ต", price: 55,
    desc: "มะม่วงสุกปั่นผสมโยเกิร์ต หอมหวานสดชื่น",
    emoji: "🥭", tag: "แนะนำ", prepTime: "4 นาที", calories: 280, popularity: 88
  },
  {
    id: "m36", storeId: "s8", name: "สตรอว์เบอร์รีสมูทตี้", price: 60,
    desc: "สตรอว์เบอร์รีนำเข้าปั่นละเอียด ผสมน้ำผึ้ง",
    emoji: "🍓", prepTime: "4 นาที", calories: 240, popularity: 84
  },
  {
    id: "m37", storeId: "s8", name: "อโวคาโดปั่นนมสด", price: 65,
    desc: "อโวคาโดเนื้อเนียน ปั่นกับนมสด หวานน้อยดีต่อสุขภาพ",
    emoji: "🥑", prepTime: "4 นาที", calories: 320, popularity: 80
  },
  {
    id: "m38", storeId: "s8", name: "รวมมิตรผลไม้", price: 45,
    desc: "ผลไม้รวม 5 ชนิด ปั่นผสมน้ำผึ้ง เสิร์ฟเย็นจัด",
    emoji: "🍹", prepTime: "3 นาที", calories: 220, popularity: 86
  },
];

export const SLOTS = [
  "11:30 น.", "11:45 น.", "12:00 น.", "12:15 น.", "12:30 น.", 
  "12:45 น.", "13:00 น.", "13:15 น.", "13:30 น.", "17:00 น.", "17:30 น.", "18:00 น."
];

// ⬇️ แก้ไข: เพิ่ม storeId ให้ประวัติเริ่มต้นทุกรายการ (กันรีวิวไปโผล่ผิดร้าน)
export const INITIAL_PAST_ORDERS: PastOrder[] = [
  { 
    id: "#SPU-8710", 
    date: "12 มี.ค. 2568 · 12:15 น.", 
    items: "ข้าวกะเพราหมูกรอบ + ไข่ดาว ×1", 
    total: 55, 
    rating: 5,
    reviewId: "r1",
    storeId: "s1"
  },
  { 
    id: "#SPU-8622", 
    date: "10 มี.ค. 2568 · 11:45 น.", 
    items: "ข้าวราดแกง 2 อย่าง ×1, ชานมไข่มุกไต้หวัน ×1", 
    total: 90, 
    rating: 4,
    reviewId: "r2",
    storeId: "s1"
  },
  {
    id: "#SPU-8501",
    date: "5 มี.ค. 2568 · 12:30 น.",
    items: "ส้มตำไทย ×1, คอหมูย่าง + ข้าวเหนียว ×1",
    total: 120,
    rating: 5,
    reviewId: "r7",
    storeId: "s5"
  },
  {
    id: "#SPU-8399",
    date: "1 มี.ค. 2568 · 17:30 น.",
    items: "ข้าวมันไก่ทอด ×1, น้ำซุปไก่ร้อน ×1",
    total: 70,
    rating: 5,
    reviewId: "r8",
    storeId: "s6"
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    userId: "67141977",
    userName: "ชารีฟ (67141977)",
    storeId: "s1",
    itemId: "m2",
    rating: 5,
    text: "กะเพราหมูกรอบอร่อยมาก หมูกรอบกรอบจริง ๆ เผ็ดกำลังดี จะมาสั่งอีก!",
    date: Date.now() - 86400000 * 3,
    orderId: "#SPU-8710"
  },
  {
    id: "r2",
    userId: "67141977",
    userName: "ชารีฟ (67141977)",
    storeId: "s1",
    itemId: "m1",
    rating: 4,
    text: "แกงรสชาติดี ปริมาณเยอะ แต่รอนานไปหน่อย",
    date: Date.now() - 86400000 * 5,
    orderId: "#SPU-8622"
  },
  {
    id: "r7",
    userId: "67141977",
    userName: "ชารีฟ (67141977)",
    storeId: "s5",
    itemId: "m19",
    rating: 5,
    text: "ส้มตำรสเด็ด! เผ็ดจัดเต็ม คอหมูย่างนุ่มหอมมาก จะมาอุดหนุนบ่อย ๆ ครับ",
    date: Date.now() - 86400000 * 7,
    orderId: "#SPU-8501"
  },
  {
    id: "r8",
    userId: "67141977",
    userName: "ชารีฟ (67141977)",
    storeId: "s6",
    itemId: "m25",
    rating: 5,
    text: "ข้าวมันไก่ทอดอร่อยมากไก่กรอบนอกนุ่มใน น้ำจิ้มรสชาติพอดี!",
    date: Date.now() - 86400000 * 14,
    orderId: "#SPU-8399"
  },
  {
    id: "r3",
    userId: "u2",
    userName: "น้องเอ (66011234)",
    storeId: "s1",
    rating: 5,
    text: "ข้าวแกงป้าศรีอร่อยมาก ปริมาณเยอะ คุ้มค่า! แม่ครัวบริการดี",
    date: Date.now() - 86400000
  },
  {
    id: "r4",
    userId: "u3",
    userName: "พี่บี (66022345)",
    storeId: "s2",
    rating: 4,
    text: "ก๋วยเตี๋ยวเรือรสเด็ด น้ำซุปเข้มข้น ลูกชิ้นอร่อย แนะนำเลย!",
    date: Date.now() - 86400000 * 2
  },
  {
    id: "r5",
    userId: "u4",
    userName: "น้องซี (66033456)",
    storeId: "s3",
    rating: 5,
    text: "ชานมไข่มุกอร่อยมาก ไข่มุกหนึบ หวานกำลังดี เป็นร้านประจำแล้ว",
    date: Date.now() - 86400000 * 4
  },
  {
    id: "r6",
    userId: "u5",
    userName: "น้องดี (66044567)",
    storeId: "s4",
    rating: 4,
    text: "ข้าวผัดหมูรสชาติต้นตำรับ ไข่สุกกำลังดี ร้านใหม่แต่ดีมาก",
    date: Date.now() - 86400000 * 6
  },
  {
    id: "r9",
    userId: "u6",
    userName: "น้องฟ้า (66055678)",
    storeId: "s5",
    rating: 5,
    text: "ส้มตำป้าแจ๋วเด็ดจริง เผ็ดอร่อย คอหมูย่างหอมมาก ร้านแนะนำสำหรับคนชอบอาหารอีสาน!",
    date: Date.now() - 86400000 * 2
  },
  {
    id: "r10",
    userId: "u7",
    userName: "พี่ต้น (66066789)",
    storeId: "s5",
    rating: 4,
    text: "ลาบหมูรสชาติดี แต่เผ็ดไปนิด ใครไม่ทานเผ็ดให้แจ้งแม่ค้าไว้ครับ",
    date: Date.now() - 86400000 * 3
  },
  {
    id: "r11",
    userId: "u8",
    userName: "น้องเจน (66077890)",
    storeId: "s6",
    rating: 5,
    text: "ข้าวมันไก่เฮียหมูอร่อยที่สุด! ไก่นุ่ม น้ำจิ้มเด็ด น้ำซุปหอม ราคาไม่แพง",
    date: Date.now() - 86400000
  },
  {
    id: "r12",
    userId: "u9",
    userName: "พี่เอ็ม (66088901)",
    storeId: "s6",
    rating: 5,
    text: "ข้าวมันไก่ทอดเป็นตำนาน! กรอบนอกนุ่มในจริง ๆ คิวเยอะหน่อยแต่คุ้มค่าที่จะรอ",
    date: Date.now() - 86400000 * 5
  },
  {
    id: "r13",
    userId: "u10",
    userName: "น้องมายด์ (66099012)",
    storeId: "s7",
    rating: 4,
    text: "ขนมจีนน้ำยากะทิเข้มข้น ผักสดเยอะ ให้ 4 ดาวเพราะรอคิวนานไปหน่อย",
    date: Date.now() - 86400000 * 2
  },
  {
    id: "r14",
    userId: "u11",
    userName: "พี่อาร์ม (66010123)",
    storeId: "s7",
    rating: 5,
    text: "ขนมจีนน้ำยาป่ารสใต้แท้ ๆ เผ็ดจัด อร่อยเหมือนกินที่นครศรีธรรมราชเลย",
    date: Date.now() - 86400000 * 4
  },
  {
    id: "r15",
    userId: "u12",
    userName: "น้องกิ๊ฟ (66011234)",
    storeId: "s8",
    rating: 5,
    text: "แตงโมปั่นเย็นฉ่ำ ดับร้อนได้ดีมาก รสชาติหวานธรรมชาติ ไม่ใส่น้ำตาลเกิน",
    date: Date.now() - 86400000
  },
  {
    id: "r16",
    userId: "u13",
    userName: "พี่นิว (66022345)",
    storeId: "s8",
    rating: 5,
    text: "มะม่วงปั่นโยเกิร์ตอร่อยมาก มะม่วงสุกหอมหวาน เหมาะกับอากาศร้อน ๆ สุด ๆ",
    date: Date.now() - 86400000 * 3
  },
  {
    id: "r17",
    userId: "u14",
    userName: "น้องแพร (66033456)",
    storeId: "s3",
    rating: 5,
    text: "ชาไทยร้านนี้อร่อยที่สุด! รสชาติเข้มข้น หวานมันนมข้น เสิร์ฟเย็นจัด",
    date: Date.now() - 86400000 * 1
  },
];