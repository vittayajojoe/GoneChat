# 🚀 Deploy GoneChat Backend บน Render.com (ฟรี)

## ขั้นตอนการ Deploy

### 1. สร้างบัญชี Render
1. ไปที่ https://render.com
2. คลิก **Get Started for Free**
3. เลือก **Sign in with GitHub**
4. อนุญาตให้ Render เข้าถึง GitHub repository

---

### 2. Deploy Backend Service

1. ใน Render Dashboard คลิก **New +** → **Web Service**

2. เลือก repository: **vittayajojoe/GoneChat**
   - ถ้าไม่เจอ คลิก **Configure account** และอนุญาต access

3. ตั้งค่าดังนี้:

   **Basic Settings:**
   - **Name**: `gonechat-backend`
   - **Region**: `Singapore` (ใกล้ไทยที่สุด)
   - **Branch**: `main`
   - **Root Directory**: `server`

   **Build & Deploy:**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Instance Type:**
   - เลือก **Free** (ฟรี 750 ชั่วโมง/เดือน)

4. คลิก **Advanced** และเพิ่ม **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://gonechat.vittayajojoe.workers.dev
   ```

5. คลิก **Create Web Service**

6. รอ deploy ประมาณ 3-5 นาที

7. เมื่อ deploy สำเร็จ จะได้ URL เช่น:
   ```
   https://gonechat-backend.onrender.com
   ```

---

### 3. ทดสอบ Backend

เปิด browser ไปที่:
```
https://gonechat-backend.onrender.com/health
```

ควรเห็น response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-06T...",
  "uptime": 123.456,
  "activeRooms": 0,
  "connectedUsers": 0,
  "memoryUsageMB": 50
}
```

---

### 4. เชื่อมต่อ Frontend กับ Backend

#### วิธีที่ 1: ตั้งค่าใน Cloudflare Workers (แนะนำ)

1. ไปที่ Cloudflare Dashboard → Workers & Pages
2. เลือก project `gonechat`
3. ไปที่ **Settings** → **Environment Variables**
4. เพิ่ม variable:
   ```
   VITE_BACKEND_URL=https://gonechat-backend.onrender.com
   ```
5. Redeploy frontend:
   ```bash
   cd frontend
   npm run build
   npx wrangler pages deploy dist --project-name=gonechat
   ```

#### วิธีที่ 2: ให้ผู้ใช้ตั้งค่าเองผ่าน UI

1. เปิด https://gonechat.vittayajojoe.workers.dev
2. คลิกปุ่ม **Settings** (เฟือง) มุมบนขวา
3. กรอก Backend URL: `https://gonechat-backend.onrender.com`
4. คลิก **บันทึก**
5. ลองสร้างห้องใหม่

---

## 🎉 เสร็จสิ้น!

ตอนนี้ GoneChat ของคุณรันบน:
- **Frontend**: https://gonechat.vittayajojoe.workers.dev (Cloudflare Workers)
- **Backend**: https://gonechat-backend.onrender.com (Render.com)

---

## ⚠️ ข้อควรรู้เกี่ยวกับ Free Tier ของ Render

### ข้อดี:
- ✅ ฟรี 100% ไม่ต้องใส่บัตรเครดิต
- ✅ รองรับ WebSocket
- ✅ Auto-deploy จาก GitHub
- ✅ SSL/HTTPS ฟรี

### ข้อจำกัด:
- ⚠️ **Server จะ sleep หลังไม่มีใครใช้งาน 15 นาที**
  - เมื่อมีคนเข้าใช้ครั้งแรก จะใช้เวลา cold start ~30-60 วินาที
  - แก้ไข: ใช้ cron job ping ทุก 10 นาที (แต่อาจผิด TOS)
- ⚠️ Bandwidth: 100GB/เดือน (เพียงพอสำหรับแชทธรรมดา)
- ⚠️ Build time: 500 ชั่วโมง/เดือน

---

## 🔧 Troubleshooting

### ❌ Build Failed
ตรวจสอบว่า `server/package.json` มี:
```json
{
  "scripts": {
    "start": "node src/server.js"
  }
}
```

### ❌ CORS Error
แก้ไข environment variable `CORS_ORIGIN` ให้ตรงกับ URL ของ frontend

### ❌ WebSocket Connection Failed
- ตรวจสอบว่า frontend ใช้ `https://` (ไม่ใช่ `http://`)
- ดูที่ Browser Console → Network tab → WS connections

---

## 📊 Monitor & Logs

ดู logs แบบ real-time:
1. ไปที่ Render Dashboard
2. เลือก service `gonechat-backend`
3. คลิก **Logs** tab

---

## 🚀 Deploy ใหม่หลังแก้ code

Render จะ auto-deploy ทุกครั้งที่ push ไปที่ GitHub branch `main`

หรือ manual deploy:
1. ไปที่ Render Dashboard
2. เลือก service
3. คลิก **Manual Deploy** → **Deploy latest commit**

---

Happy Chatting! 🔥
