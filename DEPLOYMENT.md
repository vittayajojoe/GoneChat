# GoneChat Deployment Guide

## สถาปัตยกรรม

- **Frontend**: Cloudflare Pages (Static Site)
- **Backend**: VPS/Cloud Server (Node.js + WebSocket)

---

## การ Deploy Backend (Node.js Server)

Backend ต้อง deploy บน server ที่รองรับ WebSocket connections แบบ stateful

### ตัวเลือกสำหรับ Backend Hosting:

1. **Railway.app** (แนะนำ - ง่ายที่สุด)
2. **Render.com** (Free tier มี)
3. **Fly.io** 
4. **DigitalOcean App Platform**
5. **AWS EC2 / Lightsail**
6. **VPS ของคุณเอง**

### ขั้นตอนการ Deploy บน Railway (ตัวอย่าง):

1. ติดตั้ง Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login และสร้าง project:
   ```bash
   railway login
   railway init
   ```

3. Deploy เฉพาะ server folder:
   ```bash
   cd server
   railway up
   ```

4. ตั้งค่า Environment Variables บน Railway dashboard:
   ```
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.pages.dev
   ```

5. บันทึก URL ที่ได้ เช่น `https://your-app.railway.app`

---

## การ Deploy Frontend (Cloudflare Pages)

### วิธีที่ 1: Deploy ผ่าน Wrangler CLI

1. ติดตั้ง Wrangler:
   ```bash
   npm install -g wrangler
   ```

2. Login:
   ```bash
   wrangler login
   ```

3. Deploy:
   ```bash
   wrangler pages deploy frontend/dist --project-name=gonechat
   ```

### วิธีที่ 2: Deploy ผ่าน Cloudflare Dashboard

1. Push code ไปที่ GitHub
2. ไปที่ Cloudflare Dashboard → Pages → Create a project
3. เชื่อมต่อกับ GitHub repository
4. ตั้งค่า Build:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/` (หรือเว้นว่าง)

5. ตั้งค่า Environment Variables:
   ```
   VITE_BACKEND_URL=https://your-backend.railway.app
   ```

6. Deploy!

---

## การตั้งค่าหลัง Deploy

### 1. อัพเดท CORS บน Backend

แก้ไขใน `server/src/config.js` หรือตั้งค่า environment variable:
```bash
CORS_ORIGIN=https://your-app.pages.dev
```

### 2. ทดสอบการเชื่อมต่อ

1. เปิด `https://your-app.pages.dev`
2. กดปุ่ม Settings (เฟือง) มุมบนขวา
3. ใส่ Backend URL: `https://your-backend.railway.app`
4. ลองสร้างห้อง

---

## สำหรับผู้ใช้งาน

หากผู้ใช้เข้าใช้ครั้งแรก จะต้อง:

1. คลิกปุ่ม **Settings** (เฟือง) มุมบนขวา
2. กรอก **Backend Server URL** เช่น `https://gonechat-backend.railway.app`
3. กด **บันทึก**
4. สร้างห้องแชทได้ตามปกติ

**หมายเหตุ**: URL นี้จะถูกบันทึกใน localStorage ของผู้ใช้ ไม่ต้องกรอกใหม่ทุกครั้ง

---

## วิธีตั้งค่า Default Backend URL (ไม่ต้องให้ผู้ใช้กรอก)

แก้ไขไฟล์ `.env` ใน frontend folder:

```bash
VITE_BACKEND_URL=https://your-backend.railway.app
```

จากนั้น rebuild และ deploy ใหม่

---

## การ Deploy แบบ Self-Hosted (Docker)

หากคุณมี VPS และต้องการรัน frontend + backend ด้วยกัน:

```bash
# Clone repository
git clone https://github.com/vittayajojoe/GoneChat.git
cd GoneChat

# สร้างไฟล์ .env (ถ้าต้องการ)
# echo "VITE_BACKEND_URL=http://your-domain.com" > frontend/.env

# Build และรัน
docker compose up -d --build

# เข้าถึงที่
# http://your-server-ip:8082
```

---

## Troubleshooting

### ❌ HTTP 405 เมื่อสร้างห้อง
- **สาเหตุ**: Frontend ยังไม่ได้ตั้งค่า Backend URL
- **แก้ไข**: กดปุ่ม Settings และกรอก Backend URL

### ❌ ไม่สามารถติดต่อเซิร์ฟเวอร์ Backend ได้
- ตรวจสอบว่า Backend server รันอยู่และเข้าถึงได้
- ตรวจสอบ CORS settings บน backend
- ลอง curl: `curl https://your-backend.railway.app/health`

### ❌ WebSocket connection failed
- ตรวจสอบว่า Backend server รองรับ WebSocket
- ตรวจสอบว่า URL ถูกต้อง (ต้องใช้ https:// ใน production)
- ดูที่ Browser Console สำหรับ error messages

---

## Architecture Diagram

```
┌─────────────────────────┐
│  Cloudflare Pages       │
│  (Static Frontend)      │
│  - Vue.js SPA           │
│  - nginx ไม่มี         │
└─────────┬───────────────┘
          │
          │ HTTP/WebSocket
          ▼
┌─────────────────────────┐
│  Backend Server         │
│  (Railway/VPS)          │
│  - Node.js + Express    │
│  - Socket.IO            │
│  - Room Manager         │
└─────────────────────────┘
```

---

## ข้อควรระวัง

1. **Cloudflare Pages ไม่สามารถรัน Node.js backend ได้** - มันเป็น static hosting เท่านั้น
2. **Cloudflare Workers ไม่รองรับ Socket.IO** - Workers มีข้อจำกัดด้าน WebSocket และ runtime
3. **Backend ต้องรันบน server แยก** - ใช้ Railway, Render, หรือ VPS
4. **CORS ต้องตั้งค่าให้ถูกต้อง** - Backend ต้องอนุญาต origin จาก Cloudflare Pages

---

## สรุป

1. ✅ Deploy **Backend** บน Railway/Render/VPS
2. ✅ Deploy **Frontend** บน Cloudflare Pages
3. ✅ ตั้งค่า `VITE_BACKEND_URL` ใน Cloudflare Pages environment variables
4. ✅ อัพเดท `CORS_ORIGIN` บน Backend
5. ✅ ทดสอบการทำงาน

---

Happy Chatting! 🔥
