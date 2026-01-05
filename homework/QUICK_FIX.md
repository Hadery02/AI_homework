# 🔧 Cách Fix Vấn Đề Loading

## ⚡ Quick Fix (Làm Ngay)

### **Step 1: Refresh Trang**
- Nhấn `F5` (Windows) hoặc `Cmd+R` (Mac)
- Hoặc: `Ctrl+Shift+R` (hard refresh xóa cache)

### **Step 2: Mở DevTools**
- Nhấn `F12` hoặc `Right-click` → `Inspect`
- Chuyển sang tab **Console**

### **Step 3: Test OCR**
1. Click nút **"BẬT CAM"**
2. Click nút **"QUÉT NGAY"**
3. Chờ kết quả (thường 2-5s)

### **Step 4: Kiểm Tra Console**
- Nếu thấy: `✓ OCR Worker đã sẵn sàng` → ✅ **Worker OK**
- Nếu thấy error → Xem phần Troubleshooting

---

## 📋 Điều Kiện Tiên Quyết

✅ **File `ocrWorker.js` tồn tại** (cùng folder với parking.html)  
✅ **Internet connection** (để load Tesseract.js CDN)  
✅ **Browser support:** Chrome, Firefox, Edge, Safari  
✅ **HTTPS hoặc Localhost** (cho camera)  

---

## 🧪 Verification Checklist

Sau khi refresh, kiểm tra:

- [ ] Trang load bình thường (không stuck)
- [ ] Console không có error vàng/đỏ
- [ ] Click "BẬT CAM" bật được camera
- [ ] Click "QUÉT NGAY" không tắc ui
- [ ] Thấy % progress (0% → 100%)
- [ ] Nhận được kết quả biển số

---

## 🆘 Nếu Vẫn Có Vấn Đề

### **Vấn đề 1: Still stuck at 0%**

**Kiểm tra:**
```
1. Mở DevTools (F12) → Console
2. Copy error messages
3. Kiểm tra network tab: có load Tesseract.js CDN không?
```

**Giải pháp:**
- Kiểm tra internet connection
- Try: `Ctrl+Shift+R` (hard refresh)
- Try: Open in incognito mode

### **Vấn đề 2: "Worker error" message**

**Nguyên nhân:** Web Worker có vấn đề  
**Giải pháp:** Tự động fallback sang main thread
- OCR vẫn hoạt động nhưng có UI lag 3-5s
- Đây là expected behavior

### **Vấn đề 3: File not found**

**Kiểm tra:**
```
1. Folder có chứa:
   ✅ parking.html
   ✅ ocrWorker.js  ← Quan trọng!
   ✅ sample-whitelist.json
```

**Giải pháp:**
- Tải lại file nếu missing
- Đảm bảo cùng thư mục

---

## ✅ Khi Hoạt Động Tốt

Bạn sẽ thấy:

✨ **Worker Mode (Preferred):**
- Console: `✓ OCR Worker đã sẵn sàng`
- UI smooth, không lag
- Progress % hiển thị: 0% → 100%
- Kết quả trong 2-5s

⚠️ **Main Thread Mode (Fallback):**
- Console: có error or timeout message
- UI lag 3-5s khi OCR chạy
- Progress % không hiển thị
- Kết quả vẫn trả về sau 3-5s

---

## 🔍 Console Debugging

**Mở DevTools (F12) → Console, nhìn thấy:**

✅ **Tốt:**
```
✓ OCR Worker đã sẵn sàng
```

✅ **Có vấn đề nhưng tự fix:**
```
Worker timeout, chuyển sang main thread OCR
```

❌ **Lỗi:**
```
Lỗi: Worker initialization failed
Lỗi: Tesseract not defined
```

---

## 🚀 Test Complete

Khi thành công:

1. ✅ Quét biển số hoạt động
2. ✅ Import/Export JSON hoạt động
3. ✅ Whitelist lookup nhanh
4. ✅ UI mượt mà (hoặc chấp nhận lag)

---

## 📝 Ghi Chú

- Lần đầu OCR load Tesseract.js (~2-3s), lần sau nhanh hơn
- HTTPS/Localhost required cho camera access
- Web Worker là optional, main thread fallback luôn có sẵn
- Import/Export không bị ảnh hưởng

---

**Hãy F5 refresh lại và test! 🚀**
