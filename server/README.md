# GoneChat Backend Server

Node.js + Express + Socket.IO server สำหรับ GoneChat

## การรัน Local Development

```bash
npm install
npm run dev
```

Server จะรันที่: `http://localhost:3000`

## Environment Variables

```bash
PORT=3000                                    # Port ที่ server จะรัน
NODE_ENV=production                          # development หรือ production
CORS_ORIGIN=*                                # Frontend URL ที่อนุญาตให้เข้าถึง
```

## การ Deploy

### Option 1: Railway.app (แนะนำ)

1. ติดตั้ง Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login และ init:
```bash
railway login
cd server
railway init
```

3. Deploy:
```bash
railway up
```

4. ตั้งค่า Environment Variables ใน Railway Dashboard:
```
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-app.pages.dev
```

### Option 2: Render.com

1. เชื่อมต่อ GitHub repository
2. Create Web Service
3. ตั้งค่า:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. ตั้งค่า Environment Variables

### Option 3: Fly.io

```bash
# ติดตั้ง flyctl
curl -L https://fly.io/install.sh | sh

# Login และ launch
cd server
fly launch

# Deploy
fly deploy
```

### Option 4: Docker (VPS)

```bash
# Build
docker build -t gonechat-server .

# Run
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://your-frontend.com \
  --name gonechat-server \
  gonechat-server
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Create Room
```bash
POST /api/room/create
Content-Type: application/json

{
  "ttl": 1800,
  "nickname": "YourName",
  "maxParticipants": 10
}
```

### Get Room Info
```bash
GET /api/room/:roomId
```

### App Config
```bash
GET /api/config
```

## WebSocket Events

### Client → Server
- `create_room` - สร้างห้องใหม่
- `join_room` - เข้าร่วมห้อง
- `send_message` - ส่งข้อความ
- `typing` - แจ้งสถานะกำลังพิมพ์
- `burn_room` - ลบห้องทันที (เจ้าของห้องเท่านั้น)
- `leave_room` - ออกจากห้อง

### Server → Client
- `user_joined` - มีผู้ใช้เข้าห้อง
- `user_left` - มีผู้ใช้ออกห้อง
- `new_message` - ข้อความใหม่
- `typing` - สถานะการพิมพ์
- `room_expired` - ห้องหมดอายุ
- `room_burned` - ห้องถูกลบ

## ข้อกำหนดระบบ

- Node.js 18+
- npm หรือ yarn
- WebSocket support (ไม่สามารถใช้ Cloudflare Workers ได้)

## Security Features

- Helmet.js สำหรับ security headers
- CORS protection
- Rate limiting (อนาคต)
- Input validation
- XSS protection

## Performance

- In-memory room management (ไม่ใช้ database)
- TTL-based auto cleanup
- Efficient WebSocket connections
- Low latency message delivery

---

สำหรับคำแนะนำการ deploy แบบเต็ม ดูที่ [DEPLOYMENT.md](../DEPLOYMENT.md)
