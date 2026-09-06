# GoneChat — Temporary Chat Platform

> **Chat. Then Gone.**
> 
> *คุยเสร็จ หายไป*

GoneChat เป็นแพลตฟอร์มแชทชั่วคราว (Ephemeral Communication) ที่ออกแบบมาโดย**ไม่มีประวัติการสนทนาแบบถาวร (Zero-History Architecture)**
ข้อมูลการสนทนาทั้งหมดจะถูกจัดเก็บอยู่ใน RAM ของเซิร์ฟเวอร์ชั่วคราวเท่านั้น เมื่อหมดเวลา (TTL) หรือเมื่อกด **Burn Room** ข้อมูลทั้งหมดจะถูกล้างออกจากหน่วยความจำทันที

---

## 🌟 จุดเด่นของระบบ (Core Principles)

- 🔒 **ไม่ต้องสมัครสมาชิก & ไม่ต้อง Login**: เข้าใช้งานได้ทันที ไม่มี Friend list หรือ User profile
- 🧠 **RAM-Only Architecture**: ไม่มี Database (ไม่ใช้ MySQL, PostgreSQL, MongoDB, หรือ SQLite) สำหรับเก็บข้อความ
- ⏳ **Room Lifetime (TTL)**: ตั้งเวลาหมดอายุของห้องได้ (5 นาที, 15 นาที, 30 นาที, 1 ชม., 6 ชม., 24 ชม.)
- 🔥 **Burn Room**: เจ้าของห้องสามารถกดทำลายห้องได้ทันที ทุกคนที่อยู่ในห้องจะถูกตัดการเชื่อมต่อและหน่วยความจำของห้องจะถูกล้าง
- 🚪 **Auto-Destroy**: ห้องจะถูกทำลายอัตโนมัติเมื่อสมาชิกทุกคนออกจากห้อง
- 🎲 **Random Nicknames**: มีระบบสุ่มชื่อเล่นสุดคูล (เช่น *Silent Fox*, *Quiet Owl*, *Blue Cat*) หรือกำหนดเองได้
- 📱 **QR Code & Link Sharing**: สแกนเข้าร่วมห้องได้ง่ายผ่านมือถือ พร้อมฟังก์ชัน Copy Link
- ⚡ **PWA Ready**: ติดตั้งเป็น Web App บนสมาร์ทโฟนได้ทันที (Add to Home Screen)
- 🛡️ **Zero Client-Side History**: ไม่มีการเก็บข้อความแชทลงใน `localStorage` ของเบราว์เซอร์

---

## 🏗️ โครงสร้างโปรเจกต์ (Project Structure)

```text
GoneChat/
├── server/                    # Node.js + Express + Socket.IO (RAM-Only Backend)
│   ├── src/
│   │   ├── config.js          # การตั้งค่าระบบ, ค่า TTL, Rate limits
│   │   ├── roomManager.js     # ระบบจัดการห้องและข้อความใน RAM
│   │   ├── ttlManager.js      # จัดการนับเวลาถอยหลังและการทำลายห้อง
│   │   ├── security.js        # ตรวจสอบความถูกต้อง, สุ่ม Room ID 16 หลัก, Rate Limiter
│   │   ├── websocket.js       # จัดการ WebSocket Events แบบ Real-time
│   │   └── server.js          # Express entrypoint & Health check API
│   ├── tests/
│   │   └── roomManager.test.js# Automated unit tests
│   └── Dockerfile
│
├── frontend/                  # Vue 3 + Vite + Tailwind CSS (PWA Client)
│   ├── public/
│   │   ├── favicon.svg        # ไอคอนแบรนด์ GoneChat
│   │   ├── manifest.webmanifest # PWA Web App Manifest
│   │   └── sw.js              # Service Worker สำหรับ Offline Shell
│   ├── src/
│   │   ├── pages/             # หน้า Home, CreateRoom, JoinRoom, ChatRoom
│   │   ├── components/        # ChatMessage, ChatInput, RoomTimer, UserList, QRCodeModal, BurnModal
│   │   ├── services/          # websocket.js, nickname.js
│   │   └── router/            # Vue Router
│   ├── nginx.conf             # Nginx reverse proxy config ภายใน Frontend container
│   └── Dockerfile
│
├── nginx/
│   └── default.conf           # Reverse proxy configuration
├── docker-compose.yml         # Container orchestration
└── GoneChat_Concept_and_Development_Plan.md # เอกสาร Requirement & Concept ดั้งเดิม
```

---

## 🚀 วิธีการติดตั้งและรันระบบ (Quick Start)

### วิธีที่ 1: รันด้วย Docker Compose (แนะนำ)

คำสั่งเดียวเพื่อ build และรันทั้ง Backend และ Frontend ผ่าน Nginx Reverse Proxy:

```bash
docker compose up --build
```

- **Frontend Web UI**: เข้าใช้งานได้ที่ [http://localhost:8080](http://localhost:8080)
- **Backend API & Health**: [http://localhost:3000/health](http://localhost:3000/health)

---

### วิธีที่ 2: รันสำหรับ Local Development

#### 1. รัน Backend Server
```bash
cd server
npm install
npm run dev
```
เซิร์ฟเวอร์จะเริ่มทำงานที่ `http://localhost:3000`

#### 2. รัน Frontend
```bash
cd frontend
npm install
npm run dev
```
เข้าใช้งานผ่าน Vite dev server ได้ที่ `http://localhost:5173` (โดย Vite มี Proxy ส่งต่อไปยัง Backend พอร์ต 3000 อัตโนมัติ)

---

## 🧪 การทดสอบระบบ (Testing)

รัน automated tests ของระบบ Backend เพื่อทดสอบ Room Manager, TTL Expiration, Burn Room, Rate Limiting, และ Input Sanitization:

```bash
cd server
npm test
```

ทดสอบการ Build ของส่วน Frontend:

```bash
cd frontend
npm run build
```

---

## 🔒 นโยบายความเป็นส่วนตัว (Privacy Philosophy)

- **"GoneChat ไม่เก็บประวัติข้อความการสนทนาแบบถาวร"**
- ข้อความและรายชื่อผู้ใช้งานจะถูกบันทึกอยู่ในหน่วยความจำ (RAM) ขณะที่ห้องยังเปิดอยู่เท่านั้น
- เมื่อผู้ใช้กดออกจากห้อง ข้อมูลแชทในเบราว์เซอร์จะถูกเคลียร์ทิ้งทันที
- การ Restart เซิร์ฟเวอร์จะส่งผลให้ห้องและข้อความชั่วคราวทั้งหมดหายไปโดยอัตโนมัติ (Server Restart = Temporary Data Destruction)
