# 🅿️ Parking Admin Dashboard

Full-Stack Parking Management System - React Frontend + Express Backend + SQLite

## 📁 Cấu trúc thư mục

```
Parking Admin Dashboard/
├── frontend/           # React + Vite
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── backend/            # Express.js
│   ├── db/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── README.md
└── BACKEND_SETUP.md
```

## 🚀 Quick Start

**Backend:**

```bash
cd backend && npm start
# http://localhost:5000
```

**Frontend:**

```bash
cd frontend && npm run dev
# http://localhost:5173
```

## 💾 API Endpoints

- GET `/api/vehicles` - All vehicles
- GET `/api/vehicles/search/:plateNumber` - Search
- POST `/api/vehicles` - Create
- DELETE `/api/vehicles/:id` - Delete

## 🛠️ Tech Stack

Frontend: React, TypeScript, Vite, Tailwind
Backend: Node.js, Express, SQLite3

## ✨ Features

✅ Vehicle management ✅ Search ✅ Camera scanner ✅ REST API ✅ SQLite DB

---

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for details
