
# 🍲 SPU Smart Food Queue
 
  **ระบบสั่งอาหารและจองคิวออนไลน์ล่วงหน้า โรงอาหารมหาวิทยาลัยศรีปทุม**

  [![Svelte v5](https://img.shields.io/badge/Svelte-v5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-v5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-v6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

  <p align="center">
    สั่งอาหารล่วงหน้า เลือกรอบเวลา นั่งรอชิลๆ แล้วเดินไปรับอาหารได้ทันที โดยไม่ต้องยืนต่อคิวยาว
  </p>

</div>

---

## 📌 บทนำ (Overview)

**SPU Smart Food Queue** เป็นเว็บแอปพลิเคชันแบบ Responsive Web Application ที่พัฒนาขึ้นเพื่อแก้ปัญหาความแออัดและการรอคิวนานในช่วงเวลาพักกลางวันของนักศึกษาและบุคลากร ณ อาคารโรงอาหาร มหาวิทยาลัยศรีปทุม ระบบช่วยให้ผู้ใช้งานสามารถเลือกดูเมนู สั่งอาหารแบบปรับแต่งรสชาติได้ ระบุรอบเวลานัดรับ ชำระเงินผ่าน PromptPay QR และติดตามสถานะคิวแบบ Real-time ผ่านมือถือหรือคอมพิวเตอร์ได้อย่างสะดวกสบาย

---

## ✨ ฟีเจอร์หลัก (Key Features)

- **📱 Fully Responsive Design**: รองรับการใช้งานสมบูรณ์แบบทั้งบนสมาร์ตโฟน แท็บเล็ต และคอมพิวเตอร์เดสก์ท็อป
- **🏬 Store & Menu Explorer**: ค้นหาเมนูอาหารและเลือกร้านค้าชั้นนำในโรงอาหาร เช่น ร้านข้าวแกงป้าศรี, ก๋วยเตี๋ยวเรือลุงหนวด, ชานมไข่มุกพี่จอย]
- **🌶️ Item Customization**: ปรับแต่งระดับความเผ็ด ความหวาน และระบุโน้ตเพิ่มเติมสำหรับแต่ละรายการอาหารได้
- **⏰ Flexible Time Slot Selection**: เลือกรอบเวลาที่สะดวกเดินทางมารับอาหารได้ล่วงหน้า
- **💳 Seamless QR Payment**: สแกนชำระเงินสะดวกรวดเร็วผ่าน PromptPay QR Code บนหน้าจอทันที
- **⚡ Real-time Order Tracking**: ติดตามสถานะออเดอร์ 3 ขั้นตอน (*รับออเดอร์แล้ว → กำลังปรุง → พร้อมรับอาหาร*) พร้อมเวลานับถอยหลัง
- **🧾 Electronic Receipt**: มีหน้าต่างแสดงใบเสร็จรับเงินอิเล็กทรอนิกส์พร้อมรายละเอียดชัดเจน
- **⭐ Review & History**: ดูประวัติคำสั่งซื้อย้อนหลัง และให้คะแนนความพึงพอใจร้านค้าได้
- **🛠️ Demo Control Widget**: มีปุ่มทดสอบสลับหน้าจอและข้ามขั้นตอนสถานะคำสั่งซื้อสำหรับนำเสนองาน

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| หมวดหมู่ | เทคโนโลยี | รายละเอียด |
| :--- | :--- | :--- |
| **Framework** | **Svelte 5** | ใช้ระบบ Re-activity ใหม่ล่าสุดด้วย Runes (`$state`, `$derived`, `$props`) |
| **Language** | **TypeScript** | Type-safe ตลอดทั้งโปรเจกต์ |
| **Styling** | **Tailwind CSS v4** | สไตล์ลิ่งความเร็วสูงด้วยเอนจิน Oxide ร่วมกับ `@tailwindcss/vite` |
| **Build Tool** | **Vite** | Bundler & Dev Server ความเร็วสูง |
| **Icons** | **Lucide Svelte** | ไอคอน Vector แบบ Subpath Import น้ำหนักเบา |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
spu-smart-canteen/
├── public/
│   ├── logo.png             # โลโก้แอปพลิเคชัน
│   ├── qrcode.webp          # ภาพ QR Code สำหรับชำระเงิน
│   ├── robots.txt           # ข้อกำหนดสำหรับ Search Engine Bot
│   └── llms.txt             # คำอธิบายบริบทระบบสำหรับ AI / LLMs
├── src/
│   ├── components/
│   │   ├── LoginModal.svelte    # หน้าต่างเข้าสู่ระบบนักศึกษา
│   │   ├── OptionModal.svelte   # หน้าต่างปรับแต่งระดับความหวาน/เผ็ด
│   │   └── ReceiptModal.svelte  # หน้าต่างแสดงใบเสร็จรับเงิน
│   ├── mockData.ts          # ข้อมูลจำลองร้านค้าและเมนูอาหาร
│   ├── types.ts             # นิยาม Type Interfaces ของระบบ
│   ├── App.svelte           # หน้าจอหลักของ Web Application
│   ├── app.css              # ไฟล์กำหนดสไตล์และ Tailwind CSS v4
│   └── main.ts              # Entry point สำหรับ Mount Svelte Application
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. โคลน Repository และเข้าสู่โฟลเดอร์

Bash

```
git clone https://github.com/superworgurn/SPU-Smart-Food-Queue.git
```

### 2. ติดตั้ง Dependencies

Bash

```
npm install
```

### 3. รัน Development Server

Bash

```
npm run dev
```

เปิดเบราว์เซอร์แล้วเข้าสู่ `http://localhost:5173`

  

### 4. บิลด์สำหรับ Production

Bash

```
npm run build
npm run preview
```

## 🌐 การทดสอบผ่านระบบภายนอก (Cloudflare Tunnel)

หากต้องการเปิดให้มือถือเครื่องอื่นหรือคนภายนอกทดสอบผ่าน Tunnel:

  

1.  ตรวจสอบว่าใน `vite.config.ts` ได้เปิดรับ Host เรียบร้อยแล้ว:
    
      
    
    TypeScript
    
    ```
    server: {
      host: true,
      port: 5173,
      allowedHosts: true
    }
    ```
    
2.  รัน Dev Server ด้วยโหมด Network:
    
      
    
    Bash
    
    ```
    npm run dev -- --host
    ```
    
3.  เปิด Cloudflare Tunnel ชี้มายังพอร์ตของ Vite:
    
      
    
    Bash
    
    ```
    cloudflared tunnel --url http://localhost:5173
    ```
    

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษาและการพัฒนานวัตกรรมภายใน มหาวิทยาลัยศรีปทุม (Sripatum University) ภายใต้ลิขสิทธิ์ [MIT License](https://www.google.com/search?q=LICENSE)
