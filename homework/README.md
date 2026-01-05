# Smart Parking System - Hướng Dẫn Sử Dụng

## ✨ Cải Tiến Chính

### 1. **OCR chạy trong Web Worker (Không Blocking UI)**
- Xử lý OCR không còn làm tắc UI chính
- Hiển thị tiến độ xử lý theo %
- Người dùng vẫn có thể tương tác với ứng dụng trong khi OCR đang chạy

**Cách hoạt động:**
- `ocrWorker.js` - Worker độc lập xử lý Tesseract.js
- Main thread gửi ảnh sang worker qua `postMessage()`
- Worker gửi kết quả trở lại qua message event
- Tất cả xử lý nặng diễn ra trên background thread

### 2. **Tối ưu Whitelist Lookup - O(1) thay vì O(n)**
- Dùng `Set` cho tìm kiếm biển số cực nhanh
- Với 10,000 biển số: từ ~10,000 lần so sánh xuống 1 lần
- Array `whitelist` vẫn dùng để hiển thị UI
- Hai dữ liệu cấu trúc luôn đồng bộ

**So sánh hiệu suất:**
| Whitelist Size | Array (O(n)) | Set (O(1)) | Cải thiện |
|---|---|---|---|
| 100 xe | ~50 so sánh | 1 so sánh | 50x nhanh hơn |
| 1,000 xe | ~500 so sánh | 1 so sánh | 500x nhanh hơn |
| 10,000 xe | ~5,000 so sánh | 1 so sánh | 5,000x nhanh hơn |

### 3. **Import/Export File JSON**

#### **📥 Nhập Dữ Liệu (Import)**
1. Click nút **"NHẬP JSON"**
2. Chọn file `.json` (format mẫu: `sample-whitelist.json`)
3. Chọn **GỘP** hoặc **THAY THẾ**:
   - **GỘP (Merge)**: Thêm biển số mới, giữ lại cái cũ, tự động loại trùng lặp
   - **THAY THẾ (Replace)**: Xóa toàn bộ, nhập dữ liệu mới

**Format file JSON:**
```json
{
  "exportDate": "2026-01-05T00:00:00.000Z",
  "totalPlates": 3,
  "plates": [
    "29A12345",
    "30E99999",
    "51G56789"
  ]
}
```

#### **📤 Xuất Dữ Liệu (Export)**
1. Click nút **"XUẤT JSON"**
2. File tự động tải về: `parking-whitelist-YYYY-MM-DD.json`
3. Có thể chia sẻ hoặc backup dữ liệu

**Tính năng xác thực:**
- Tự động làm sạch ký tự đặc biệt
- Loại bỏ trùng lặp
- Kiểm tra độ dài biển số (tối thiểu 3 ký tự)
- Cảnh báo nếu file không hợp lệ

### 4. **Cải Tiến Khác**
- Thêm hiển thị độ chính xác OCR
- Nút "QUÉT NGAY" disabled khi đang xử lý
- Xóa watcher deep dồi dào, dùng `saveToStorage()` rõ ràng
- Hằng số regex tái sử dụng

---

## 🚀 Cách Sử Dụng

### **Quét Biển Số (Camera)**
1. Click **BẬT CAM** 
2. Đưa camera hướng vào biển số xe
3. Click **QUÉT NGAY** để chụp
4. Chờ kết quả (OCR chạy background)

### **Nhập Tay**
1. Ghi biển số vào ô "Nhập tay"
2. Click **KIỂM TRA** hoặc Enter

### **Quản Lý Danh Sách**
- **Thêm**: Ghi biển số mới → Click **LƯU**
- **Xóa**: Click icon thùng rác
- **Nhập từ file**: Click **NHẬP JSON**
- **Xuất backup**: Click **XUẤT JSON**

---

## 📁 Cấu Trúc File

```
PackCar/
├── parking.html          # Giao diện chính
├── ocrWorker.js          # Web Worker xử lý OCR
├── sample-whitelist.json # File mẫu để test import
└── README.md             # Hướng dẫn này
```

---

## ⚙️ Yêu Cầu Kỹ Thuật

- **Browser**: Chrome 79+, Firefox 92+, Edge 79+, Safari 14.1+ (hỗ trợ Web Worker)
- **HTTPS/Localhost**: Cần HTTPS hoặc Localhost để bật Camera
- **Storage**: ~5-10MB localStorage (đủ cho 10,000+ biển số)

---

## 💾 Lưu Trữ Dữ Liệu

- Dữ liệu tự động lưu vào **localStorage** (không cần Server)
- Mỗi lần thêm/xóa/import sẽ tự động cập nhật
- Dữ liệu tồn tại qua các phiên trình duyệt
- Có thể export backup bất kỳ lúc nào

---

## 🔍 Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| Camera không bật | Đảm bảo dùng HTTPS hoặc Localhost, cho phép quyền camera |
| OCR chậm lần đầu | Lần đầu tải Tesseract.js (~2-3s), lần sau nhanh hơn |
| Import file thất bại | Kiểm tra format JSON có đúng không, dùng `sample-whitelist.json` làm mẫu |
| localStorage đầy | Xóa bỏ dữ liệu cũ hoặc nâng cấp lên IndexedDB |

---

## 📊 So Sánh Trước/Sau

### **Trước Cải Tiến**
- ❌ OCR chạy main thread → Tắc UI
- ❌ Lookup O(n) → Chậm với nhiều biển số
- ❌ Không import/export
- ❌ localStorage deep watch phí phạm

### **Sau Cải Tiến**
- ✅ OCR chạy Web Worker → UI mượt mà
- ✅ Lookup O(1) → Siêu nhanh
- ✅ Import/Export JSON → Quản lý dữ liệu linh hoạt
- ✅ Tối ưu storage → Chỉ lưu khi cần

---

**Phiên bản:** 2.0 - Web Worker & Import/Export  
**Ngày cập nhật:** 2026-01-05
