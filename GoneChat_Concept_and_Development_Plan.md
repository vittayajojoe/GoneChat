# GoneChat — Temporary Chat Platform

> **Chat. Then Gone.**
>
> คุยเสร็จ หายไป

## 1. Product Concept

**GoneChat** คือแพลตฟอร์มแชทชั่วคราวที่ออกแบบมาโดยไม่มีประวัติการสนทนาแบบถาวร

แนวคิดหลัก:

```text
สร้างห้อง → แชร์ Link / QR → คุย → หมดเวลา/กดจบ → ห้องหาย
```

จุดยืนของ Product:

> ไม่ใช่แอปแชทที่ "เก็บแล้วค่อยลบ"
>
> แต่เป็นแอปที่ออกแบบให้ "ไม่มีประวัติถาวรตั้งแต่แรก"

### Core Principles

- ไม่ต้องสมัครสมาชิก
- ไม่ต้อง Login
- ไม่ต้องมี Friend list
- ไม่ต้องมี Inbox
- ไม่เก็บประวัติ Chat แบบถาวร
- ห้องแชทมีอายุ (TTL)
- ผู้ใช้สามารถทำลายห้องได้
- ข้อมูล Chat อยู่ใน Memory ของ Server ชั่วคราว
- เมื่อห้องหมดอายุ/ถูกทำลาย ข้อมูลในห้องถูกล้างจากระบบ Application
- รองรับการทำ E2EE ในระยะต่อไป

---

# 2. Brand

## ชื่อ

# GoneChat

### Tagline หลัก

> **Chat. Then Gone.**

### Tagline ภาษาไทย

> **คุยเสร็จ หายไป**

### Alternative Taglines

- Chat without history.
- Nothing to remember.
- Talk. Share. Gone.
- Temporary conversations. No history.
- คุยตอนนี้ ไม่ต้องมีวันหลัง

### Brand Personality

- Minimal
- Privacy-first
- Modern
- Fast
- Simple
- Temporary
- Trustworthy

---

# 3. Target Users

## Personal

- คนที่ต้องการคุยเรื่องชั่วคราว
- ส่งข้อมูลให้เพื่อน
- แชร์ข้อมูลที่ไม่ต้องการเก็บเป็นประวัติ
- คุยเรื่องงานเฉพาะกิจ

## Work

- ห้องคุยงานชั่วคราว
- ประชุมสั้น ๆ
- คุยกับทีมภายนอก
- ส่งข้อมูลระหว่างทีม

## Organizations

ในอนาคตสามารถทำเป็น Private Temporary Communication Platform สำหรับองค์กร

---

# 4. User Journey

```text
                    ┌──────────────┐
                    │   GoneChat   │
                    └──────┬───────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
          Create Room            Join Room
                 │                   │
                 ▼                   ▼
          Configure TTL         Enter Nickname
                 │                   │
                 └─────────┬─────────┘
                           ▼
                       Chat Room
                           │
                  ┌────────┴────────┐
                  │                 │
              Chat normally      Burn Room
                  │                 │
                  ▼                 ▼
              TTL expires      Destroy Room
                  │                 │
                  └────────┬────────┘
                           ▼
                    Room disappears
                           │
                           ▼
                         Done
```

---

# 5. Main Features

## 5.1 Create Room

ผู้ใช้สร้างห้องโดยไม่ต้อง Login

ข้อมูลที่กำหนด:

- Nickname
- Room Lifetime
- Message Lifetime (optional)
- Maximum participants (optional)
- Room password (Phase 2)

ตัวอย่าง:

```text
Room Lifetime

○ 5 minutes
○ 15 minutes
● 30 minutes
○ 1 hour
○ 6 hours
○ 24 hours
```

---

# 6. Room ID

Room ID ต้องสุ่มและเดายาก

ตัวอย่าง:

```text
X8K29P
```

แต่ Production ควรใช้ entropy สูง เช่น:

```text
a8F2kL9xPq7Z4mT6
```

ห้ามใช้:

```text
123456
000001
room001
```

ตัวอย่าง URL:

```text
https://gonechat.example/r/a8F2kL9xPq7Z4mT6
```

---

# 7. Join Room

ผู้ใช้เปิด Link หรือ Scan QR

```text
Enter your name

[ Anonymous Fox ]

[ Join Room ]
```

ไม่จำเป็นต้องใช้ Email หรือ Password

สามารถสร้างชื่อแบบสุ่มได้:

- Silent Fox
- Blue Cat
- Green Panda
- Quiet Owl

---

# 8. QR Code

หลังสร้างห้อง ให้แสดง QR Code

```text
┌─────────────────────┐
│                     │
│      QR CODE        │
│                     │
│                     │
└─────────────────────┘

Room: a8F2kL9xPq7Z4mT6

[ Copy Link ]
[ Share ]
```

---

# 9. Chat Room

ตัวอย่าง UI:

```text
┌────────────────────────────┐
│ 🔒 GoneChat       12:42     │
│ Room expires in 18:21       │
├────────────────────────────┤
│                            │
│ Anonymous Fox              │
│ สวัสดีครับ                 │
│                            │
│                สวัสดีครับ │
│                Wittaya     │
│                            │
│ Anonymous Fox              │
│ ส่งข้อมูลให้แล้วครับ       │
│                            │
├────────────────────────────┤
│ Type message...        ➤   │
└────────────────────────────┘
```

องค์ประกอบ:

- Message list
- Message input
- Send
- Online users
- Room timer
- Room information
- Burn Room
- Exit

---

# 10. Room Timer

แสดงเวลาที่เหลือ

```text
🟢 Room active

Expires in

00:14:32
```

เมื่อหมดเวลา:

```text
💨 This room has disappeared.

There is no conversation history.
```

---

# 11. Burn Room

เจ้าของห้องสามารถทำลายห้องทันที

ปุ่ม:

```text
🔥 Burn Room
```

Confirmation:

```text
Are you sure?

All participants will be disconnected
and this room will be destroyed.

[ Cancel ] [ Burn Room ]
```

หลังยืนยัน:

```text
🔥 Room destroyed
```

---

# 12. Exit

ผู้ใช้สามารถออกจากห้องได้

```text
[ Exit Room ]
```

หากออกจากห้อง:

- WebSocket ถูกปิด
- ข้อมูลใน Client memory ถูกล้าง
- ไม่บันทึก Chat history

หากเป็นคนสุดท้ายในห้อง:

```text
Room can be automatically destroyed
```

---

# 13. Message TTL

ในอนาคตสามารถกำหนดอายุแต่ละข้อความได้

ตัวเลือก:

```text
10 seconds
30 seconds
1 minute
5 minutes
```

ตัวอย่าง:

```text
A: รหัสคือ 4839

⏱ Disappears in 10 seconds
```

เมื่อครบเวลา:

```text
Message disappeared
```

---

# 14. Dead Drop

Feature สำหรับส่งข้อมูลแบบเปิดครั้งเดียว

Flow:

```text
Create Dead Drop
       ↓
Write Message
       ↓
Set TTL
       ↓
Generate Link
       ↓
Recipient opens link
       ↓
Message displayed
       ↓
Message destroyed
```

ตัวอย่าง:

```text
GoneChat Dead Drop

Message:
"รหัสเข้าประตูคือ 4839"

Expires:
5 minutes

[ Create Dead Drop ]
```

ผู้รับเปิด:

```text
Message

รหัสเข้าประตูคือ 4839

5...4...3...2...1

💨 Destroyed
```

---

# 15. Temporary Meeting

Roadmap ระยะยาว

```text
GoneChat Meeting

Participants: 8

Meeting expires:
18:00

After meeting:

🔥 Everything disappears
```

สามารถต่อยอดเป็น:

- Temporary meeting room
- Voice
- Video
- Screen sharing

โดยต้องประเมิน Infrastructure เพิ่มเติม

---

# 16. Temporary Workspace

ระยะยาว:

```text
GoneChat
│
├── Temporary Chat
├── Dead Drop
├── Temporary File
├── Temporary Note
├── Temporary Meeting
└── Temporary Workspace
```

Positioning:

> **Temporary Communication Platform**

ไม่จำกัดตัวเองอยู่แค่ Chat

---

# 17. Security & Privacy Philosophy

## สิ่งที่ต้องการ "ไม่เก็บ"

GoneChat ควรออกแบบให้:

- ไม่เก็บข้อความลง Database
- ไม่เก็บ Chat history
- ไม่สร้าง User account โดยไม่จำเป็น
- ไม่เก็บ Contact list
- ไม่เก็บไฟล์ถาวร

## สิ่งที่ต้องระวัง

คำว่า:

> "ไม่เก็บข้อมูลอะไรเลย"

ไม่ควรใช้เป็นคำรับประกันแบบเด็ดขาดจนกว่าจะตรวจสอบ Infrastructure ทั้งหมด

เพราะอาจมี:

- IP address
- Web server logs
- Load balancer logs
- Error logs
- Monitoring
- Security logs
- Crash reports

ดังนั้น Product Policy ควรระบุให้ชัดว่าอะไรไม่เก็บ และ metadata ใดอาจถูกประมวลผลเพื่อความปลอดภัย/การทำงาน

---

# 18. RAM-only Architecture

แนวคิดหลัก:

```text
User A
   │
   │ WebSocket
   ▼
┌──────────────────────┐
│    Chat Server       │
│                      │
│      RAM ONLY        │
│                      │
│ Room A               │
│ ├── users            │
│ ├── messages         │
│ └── expiresAt        │
└──────────┬───────────┘
           │
           │ WebSocket
           ▼
        User B
```

ไม่มี Chat Database

ไม่ใช้:

- MySQL
- PostgreSQL
- MongoDB

สำหรับข้อความ Chat ใน MVP

---

# 19. Server Restart Behavior

นี่ควรถือเป็น Feature

```text
Server Restart
      ↓
RAM cleared
      ↓
All temporary rooms disappear
```

ดังนั้น:

> Server Restart = Temporary Data Destruction

แต่ต้องแจ้งผู้ใช้ว่า Room อาจหายก่อน TTL หากระบบ Restart/Crash

---

# 20. End-to-End Encryption

Phase 2/3 ควรเพิ่ม E2EE

แนวคิด:

```text
User A

"สวัสดี"

   ↓

Encrypt

   ↓

Server
🔒 8F72A91...

   ↓

User B

   ↓

Decrypt

   ↓

"สวัสดี"
```

Server ไม่ควรเห็น plaintext หากออกแบบ E2EE อย่างถูกต้อง

## ข้อควรระวัง

E2EE ต้องออกแบบเรื่อง:

- Key generation
- Key exchange
- Room key
- Participant join/leave
- Key rotation
- Replay protection
- Forward secrecy
- Message authentication

ไม่ควรเขียน Cryptography เองโดยไม่มีพื้นฐานด้าน Security Engineering

---

# 21. HTTPS / WebSocket

Production ต้องใช้:

```text
HTTPS
WSS
```

ไม่ควรใช้:

```text
HTTP
WS
```

สำหรับ Production

Architecture:

```text
Browser
   │
 HTTPS / WSS
   ▼
Cloudflare / Load Balancer
   │
   ▼
Nginx
   │
   ▼
Node.js WebSocket Server
```

---

# 22. Recommended Technology Stack

## Frontend

แนะนำ:

```text
Vue 3
Vite
Tailwind CSS
PWA
```

Alternative MVP:

```text
HTML
CSS
JavaScript
```

## Backend

```text
Node.js
Socket.IO
```

หรือ:

```text
Node.js
ws
```

## Reverse Proxy

```text
Nginx
```

## OS

```text
Ubuntu Server
```

## Container

```text
Docker
Docker Compose
```

---

# 23. Android Strategy

ไม่จำเป็นต้องเขียน Native Android ตั้งแต่แรก

## Phase 1

ทำเป็น PWA

```text
Android
   ↓
Chrome
   ↓
GoneChat
   ↓
Add to Home Screen
   ↓
App-like experience
```

## Phase 2

ทำ APK ด้วย:

```text
GoneChat PWA
      ↓
Capacitor
      ↓
Android APK
```

ข้อดี:

- ใช้ Codebase เดียว
- Web และ Android ใช้ UI ร่วมกัน
- พัฒนาเร็ว
- Maintenance ง่าย

---

# 24. System Architecture

```text
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │   Cloudflare  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │     Nginx     │
                    └───────┬───────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
     ┌───────────────┐             ┌────────────────┐
     │ Web Frontend  │             │ WebSocket API  │
     │ Vue / PWA     │             │ Node.js        │
     └───────────────┘             └───────┬────────┘
                                           │
                                           ▼
                                   ┌────────────────┐
                                   │   RAM ONLY     │
                                   │                │
                                   │ Room Manager   │
                                   │ Message TTL    │
                                   │ User Sessions  │
                                   └────────────────┘
```

---

# 25. Backend Data Model

ไม่ใช้ Database

Object ใน Memory:

```javascript
rooms = {
  "a8F2kL9xPq7Z4mT6": {
    id: "a8F2kL9xPq7Z4mT6",
    createdAt: 1750000000000,
    expiresAt: 1750001800000,
    ownerId: "temporary-user-id",
    users: [],
    messages: []
  }
}
```

Production ควรใช้ server-side structures ที่เหมาะสมและไม่เก็บข้อมูลเกินจำเป็น

---

# 26. Suggested Project Structure

```text
gonechat/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.vue
│   │   │   ├── CreateRoom.vue
│   │   │   ├── JoinRoom.vue
│   │   │   └── ChatRoom.vue
│   │   │
│   │   ├── components/
│   │   │   ├── ChatMessage.vue
│   │   │   ├── ChatInput.vue
│   │   │   ├── RoomTimer.vue
│   │   │   ├── UserList.vue
│   │   │   └── QRCode.vue
│   │   │
│   │   └── services/
│   │       └── websocket.js
│   │
│   └── vite.config.js
│
├── server/
│   ├── server.js
│   ├── websocket.js
│   ├── roomManager.js
│   ├── ttlManager.js
│   ├── security.js
│   └── config.js
│
├── nginx/
│   └── default.conf
│
├── docker/
│
├── docker-compose.yml
│
└── README.md
```

---

# 27. WebSocket Events

ตัวอย่าง API Event

```text
create_room
join_room
leave_room
send_message
message_expired
room_expired
burn_room
user_joined
user_left
typing
```

ตัวอย่าง:

```javascript
socket.emit("create_room", {
  ttl: 1800
});
```

ส่งข้อความ:

```javascript
socket.emit("send_message", {
  roomId,
  message
});
```

Server broadcast:

```javascript
io.to(roomId).emit("new_message", message);
```

---

# 28. Room Lifecycle

```text
CREATE
  │
  ▼
ACTIVE
  │
  ├───────────────┐
  │               │
  ▼               ▼
TTL expires     Burn Room
  │               │
  └───────┬───────┘
          ▼
       DESTROY
          │
          ▼
       MEMORY FREE
```

---

# 29. Message Lifecycle

```text
User writes message
        ↓
Client validation
        ↓
Optional encryption
        ↓
WebSocket
        ↓
Server RAM
        ↓
Broadcast
        ↓
Recipients
        ↓
Message TTL
        ↓
Delete
```

---

# 30. Abuse Protection

แม้ไม่เก็บ Chat ก็ต้องป้องกัน Abuse

ควรมี:

- Rate limit
- Connection limit
- Room creation limit
- Maximum message size
- Maximum room participants
- Maximum room lifetime
- WebSocket authentication/session token
- IP-based abuse protection (ถ้าจำเป็น)
- CAPTCHA/Proof-of-work สำหรับการสร้างห้องจำนวนมาก (พิจารณาภายหลัง)

---

# 31. File Sharing

ไม่แนะนำให้ใส่ใน MVP

เพราะทำให้เกิด:

```text
Storage
Bandwidth
Malware scanning
File cleanup
Privacy
Abuse
```

Phase 2 สามารถทำ:

```text
Temporary File
       ↓
Encrypted
       ↓
Object Storage
       ↓
TTL
       ↓
Automatic deletion
```

ต้องตรวจสอบว่าการลบจาก Object Storage, cache, backup และ CDN สอดคล้องกับ Privacy Policy ที่ประกาศไว้

---

# 32. Screenshot Limitation

ไม่ควรโฆษณาว่า:

> "ป้องกัน Screenshot"

เพราะ Web/PWA ไม่สามารถป้องกัน Screenshot ได้อย่างสมบูรณ์

ควรแสดง:

```text
⚠️ Temporary does not mean impossible to copy.

Recipients may still take screenshots,
record the screen, or manually copy content.
```

---

# 33. MVP Scope

## Version 0.1

ต้องมี:

- Home
- Create Room
- Join Room
- Nickname
- Room ID
- Share Link
- WebSocket
- Real-time Chat
- Room TTL
- Online users
- Exit Room
- Burn Room
- Auto destroy
- PWA

ยังไม่ต้องมี:

- Login
- Database
- Friend list
- File upload
- Voice
- Video
- E2EE

---

# 34. Version 0.2

เพิ่ม:

- QR Code
- Message TTL
- Room password
- Better UI
- Dark mode
- Mobile optimization
- Rate limiting
- Security headers
- Monitoring แบบไม่เก็บ Chat content

---

# 35. Version 0.3

เพิ่ม:

- E2EE
- Dead Drop
- One-time message
- Temporary file
- Advanced room settings

---

# 36. Version 1.0

```text
GoneChat
│
├── Temporary Chat
├── Dead Drop
├── Message TTL
├── Room TTL
├── E2EE
├── QR
├── Temporary File
└── PWA
```

---

# 37. Android Version

หลัง Web/PWA เสถียร:

```text
Vue PWA
   ↓
Capacitor
   ↓
Android
   ↓
Google Play
```

Package name ตัวอย่าง:

```text
app.gonechat.android
```

หรือ

```text
com.gonechat.app
```

ต้องตรวจสอบ Domain และ Package Name ที่ว่างจริงก่อนใช้งาน

---

# 38. Development Roadmap

## Phase 1 — Design

ระยะเวลา: 1–2 วัน

ทำ:

- Brand
- Logo
- UI Flow
- Wireframe
- UX
- Color system
- Typography

---

## Phase 2 — Backend Prototype

ระยะเวลา: 2–3 วัน

ทำ:

- Node.js
- WebSocket
- Room manager
- TTL
- Join/leave
- Message broadcast
- Burn room

---

## Phase 3 — Frontend

ระยะเวลา: 3–5 วัน

ทำ:

- Home
- Create Room
- Join Room
- Chat UI
- Timer
- Room information
- Responsive UI

---

## Phase 4 — PWA

ระยะเวลา: 1–2 วัน

ทำ:

- Manifest
- Service Worker
- Install
- App icon
- Splash screen
- Offline fallback

หมายเหตุ: ตัว Chat เองต้องการ Network; Offline mode ควรเป็นเพียงหน้า shell/fallback ไม่ควรเก็บ Chat history เพื่ออ้างว่าเป็น zero-history

---

## Phase 5 — Security

ทำ:

- HTTPS
- WSS
- CSP
- Security headers
- Rate limiting
- Input validation
- Message size limits
- Room limits
- Dependency audit
- Penetration testing

---

## Phase 6 — E2EE

ทำหลัง MVP เสถียร

ไม่ควรทำ Cryptography เอง

---

## Phase 7 — Android

```text
PWA
 ↓
Capacitor
 ↓
APK / AAB
 ↓
Google Play
```

---

# 39. Testing Plan

## Functional

ทดสอบ:

- Create room
- Join room
- Multiple users
- Send message
- Leave
- Burn
- TTL
- Room destruction

## Security

ทดสอบ:

- Room ID guessing
- Message injection
- XSS
- WebSocket abuse
- Rate limit bypass
- Oversized messages
- Connection flooding

## Privacy

ตรวจสอบว่า:

- Message ไม่ถูกเขียน Database
- Message ไม่อยู่ใน application log
- Error log ไม่แสดง message
- Nginx log ไม่บันทึก sensitive URL parameters
- Browser localStorage ไม่เก็บ Chat history
- sessionStorage ไม่เก็บข้อมูลเกินจำเป็น
- Room ถูกล้างตาม lifecycle

---

# 40. Important Privacy Caveat

GoneChat ควรสื่อสารอย่างรับผิดชอบว่า:

> "GoneChat ไม่เก็บประวัติข้อความการสนทนาแบบถาวร"

แทนการใช้ข้อความกว้าง ๆ ว่า:

> "GoneChat ไม่เก็บข้อมูลใด ๆ"

เพราะ Infrastructure บางส่วนอาจต้องประมวลผล metadata เพื่อให้บริการและป้องกัน Abuse

---

# 41. Suggested Homepage

```text
┌────────────────────────────────────────┐
│                                        │
│              GoneChat                  │
│                                        │
│          Chat. Then Gone.              │
│                                        │
│     Temporary conversations.            │
│          No chat history.               │
│                                        │
│       ┌──────────────────┐             │
│       │   Create Room    │             │
│       └──────────────────┘             │
│                                        │
│       ┌──────────────────┐             │
│       │    Join Room     │             │
│       └──────────────────┘             │
│                                        │
│          No account required           │
│                                        │
└────────────────────────────────────────┘
```

---

# 42. Suggested Chat Screen

```text
┌─────────────────────────────────────┐
│ GoneChat                       ⋮    │
│ 🟢 Active · 12:34 remaining         │
├─────────────────────────────────────┤
│                                     │
│  Anonymous Fox                      │
│  สวัสดีครับ                        │
│                                     │
│                     สวัสดีครับ      │
│                     Wittaya         │
│                                     │
│  Anonymous Fox                      │
│  เรียบร้อยครับ                      │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Type a message...               ➤   │
├─────────────────────────────────────┤
│ 🔥 Burn Room       🚪 Exit          │
└─────────────────────────────────────┘
```

---

# 43. Recommended UX Rules

1. ไม่ให้ผู้ใช้รู้สึกว่าต้องสมัครสมาชิก
2. สร้างห้องให้เร็วที่สุด
3. แสดงเวลาที่เหลือชัดเจน
4. เตือนก่อนห้องหมดอายุ
5. Burn Room ต้องเข้าใจง่าย
6. อย่าซ่อน Privacy Model
7. อย่าทำ UI ซับซ้อนเหมือน Messenger
8. เน้น "temporary" เป็นหัวใจของ UX

---

# 44. Product Differentiation

คู่แข่ง/ผลิตภัณฑ์ใกล้เคียงอาจมี:

- Secret Chat
- Disappearing Messages
- Temporary Rooms
- Anonymous Chat

แต่ GoneChat ควรวางตัวเองว่า:

> **Temporary-first**

ไม่ใช่:

> Permanent chat + delete option

ความแตกต่างนี้ควรอยู่ทั้งใน Architecture และ UX

---

# 45. Future Business Model

## Free

```text
1 room
10 participants
Maximum TTL: 1 hour
```

## Pro

```text
More participants
Longer TTL
Password rooms
Dead Drop
Temporary files
Advanced controls
```

## Business

```text
Private deployment
Organization management
SSO
Custom domain
Admin policies
Private infrastructure
```

---

# 46. Infrastructure Starting Point

MVP สามารถเริ่มด้วย:

```text
Ubuntu Server
2 CPU
2–4 GB RAM
Docker
Nginx
Node.js
Cloudflare
```

สิ่งที่ต้องติดตามหลัก ๆ:

- Concurrent WebSocket connections
- CPU
- RAM
- Network bandwidth
- Connection rate
- Room count

เนื่องจากไม่มี Chat Database พื้นที่ Disk ไม่ใช่ bottleneck หลักของข้อความ

---

# 47. Docker Architecture

```text
docker-compose
│
├── nginx
│
├── frontend
│
└── websocket-server
```

ใน MVP ไม่จำเป็นต้องมี:

```text
mysql
postgres
mongodb
```

---

# 48. Production Scaling

เมื่อผู้ใช้เพิ่มขึ้น:

```text
                  Load Balancer
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Node #1       Node #2      Node #3
```

แต่ต้องแก้ปัญหาเรื่อง Room ที่อยู่คนละ Node

แนวทางในอนาคต:

```text
Node
 │
 └── Pub/Sub
        │
        ▼
      Redis
```

อย่างไรก็ตาม Redis จะเปลี่ยน Data Architecture จาก single-process RAM-only ไปสู่ distributed temporary state ดังนั้นต้องออกแบบ TTL และ deletion semantics ให้รัดกุม

---

# 49. First Technical Milestone

เป้าหมายแรก:

> เปิด Browser 2 เครื่อง แล้ว Chat กันได้ โดยไม่มี Database

Test:

```text
Browser A
   │
   │ Create Room
   ▼
Room ABC
   ▲
   │
   │ Join
Browser B
```

A:

```text
Hello
```

B:

```text
Hello
```

จากนั้น:

```text
Burn Room
```

ผล:

```text
A → disconnected
B → disconnected
Room → destroyed
Memory → cleared
```

---

# 50. Definition of Done — MVP

ถือว่า MVP เสร็จเมื่อ:

- [ ] Create Room ได้
- [ ] Join Room ได้
- [ ] Real-time Chat ได้
- [ ] รองรับหลายคน
- [ ] Room TTL ทำงาน
- [ ] Burn Room ทำงาน
- [ ] Room ถูกล้างหลังหมดอายุ
- [ ] ไม่มี Chat Database
- [ ] ไม่มี Chat history บน Client
- [ ] HTTPS/WSS
- [ ] Rate limiting
- [ ] PWA ติดตั้งบน Android ได้
- [ ] Responsive
- [ ] Security test ผ่าน
- [ ] Privacy policy สอดคล้องกับระบบจริง

---

# 51. Recommended Development Order

ลำดับที่แนะนำ:

```text
1. Brand / UI
        ↓
2. Node.js WebSocket
        ↓
3. Room Manager
        ↓
4. TTL
        ↓
5. Chat UI
        ↓
6. Burn Room
        ↓
7. PWA
        ↓
8. Security
        ↓
9. Deploy
        ↓
10. Testing
        ↓
11. E2EE
        ↓
12. Dead Drop
        ↓
13. Android APK
```

---

# 52. Final Product Vision

```text
                         GONECHAT
                    Chat. Then Gone.
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    Temporary Chat     Dead Drop      Temporary File
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                  Temporary Communication
                       Platform
```

เป้าหมายระยะยาว:

> **A communication platform designed for conversations that are meant to disappear.**

หรือภาษาไทย:

> **แพลตฟอร์มการสื่อสารสำหรับบทสนทนาที่ไม่จำเป็นต้องมีวันพรุ่งนี้**

---

# 53. Immediate Next Step

เริ่มจาก **GoneChat MVP** ก่อน:

```text
Vue 3 + Vite
       +
Node.js + WebSocket
       +
RAM-only Room Manager
       +
Nginx
       +
Docker
       +
PWA
```

และยังไม่ใส่:

```text
Database
Login
File upload
Voice
Video
```

หลังจาก MVP เสถียร ค่อยเพิ่ม:

```text
E2EE
Message TTL
Dead Drop
Temporary File
Android
```

นี่จะทำให้ GoneChat มี Architecture ที่ตรงกับ Concept ตั้งแต่วันแรก และไม่ต้องเสียเวลาเขียนระบบใหญ่ก่อนพิสูจน์ว่า Product มีคนใช้งานจริงหรือไม่
