# Parking Admin Dashboard - Full Stack

Ứng dụng quản lý bãi đỗ xe với React Frontend + Express Backend + SQLite Database

## 📁 Cấu trúc thư mục

```
Parking Admin Dashboard/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── app/
│   │   │   └── components/
│   │   └── services/
│   │       └── vehicleAPI.ts
│   ├── package.json
│   └── vite.config.ts
├── backend/          # Express.js backend
│   ├── db/
│   │   └── database.js      # SQLite setup
│   ├── models/
│   │   └── Vehicle.js       # Vehicle model
│   ├── routes/
│   │   └── vehicles.js      # API routes
│   ├── server.js            # Main server
│   └── package.json
└── README.md
```

## 🚀 Cài đặt & Chạy

### Backend Setup

```bash
cd backend
npm install
npm start
# Server chạy tại http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại http://localhost:5173
```

## 📡 REST API Endpoints

### Vehicles Management

- **GET** `/api/vehicles` - Lấy tất cả xe
- **GET** `/api/vehicles/search/:plateNumber` - Tìm kiếm xe theo biển số
- **GET** `/api/vehicles/:id` - Lấy xe theo ID
- **POST** `/api/vehicles` - Thêm xe mới
- **PUT** `/api/vehicles/:id` - Cập nhật xe
- **DELETE** `/api/vehicles/:id` - Xóa xe

### Request/Response Examples

#### Create Vehicle (POST)

```json
{
  "plateNumber": "29A-12345",
  "ownerName": "Nguyễn Văn A",
  "phone": "0912345678",
  "vehicleType": "Ô tô"
}
```

#### Search Vehicle (GET /api/vehicles/search/29A-12345)

```json
{
  "isValid": true,
  "vehicleInfo": {
    "id": 1,
    "plateNumber": "29A-12345",
    "ownerName": "Nguyễn Văn A",
    "phone": "0912345678",
    "vehicleType": "Ô tô",
    "registeredDate": "15/10/2025"
  }
}
```

## 💾 Database

SQLite database (`backend/db/parking.db`) tự động được tạo khi start backend lần đầu.

### Schema

```sql
CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plateNumber TEXT UNIQUE NOT NULL,
  ownerName TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicleType TEXT NOT NULL,
  registeredDate TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🎯 Features

- ✅ Danh sách xe đăng ký
- ✅ Tìm kiếm xe theo biển số
- ✅ Thêm xe mới
- ✅ Xóa xe khỏi danh sách
- ✅ Quét QR code / Camera
- ✅ Hiển thị kết quả hợp lệ/cảnh báo
- ✅ REST API Backend
- ✅ SQLite Database

## 🔗 Kết nối Frontend & Backend

Frontend được cấu hình kết nối Backend tại:

- **Local**: `http://localhost:5000`
- **CORS**: Cho phép từ `localhost:5173` và `localhost:5174`

## 📝 Notes

- Database sẽ tự động tạo với 5 xe mẫu khi chạy lần đầu
- Sử dụng SQLite - không cần database server riêng
- API response format: JSON
- All timestamps: Vietnamese locale format
