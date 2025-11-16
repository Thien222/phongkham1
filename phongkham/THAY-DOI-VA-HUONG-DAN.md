# Tóm tắt các thay đổi đã thực hiện

## ✅ ĐÃ HOÀN THÀNH

### 1. **Backend - Database Schema** ✅
- **Patient Model**: Thêm các trường
  - `queueNumber` - Mã số thứ tự (tự động, reset mỗi ngày)
  - `initialVaOd` / `initialVaOs` - Thị lực mắt phải/trái
  - `hasGlasses` - Có đeo kính không
  - `visitReason` - Lý do đến khám
  - `notes` - Ghi chú

- **Refraction Model**: Thêm 3 loại khúc xạ và các trường bổ sung
  - **Skiascopy** (Khúc xạ khách quan): `skiasOdSph`, `skiasOdCyl`, `skiasOdAxis`, `skiasOsSph`, `skiasOsCyl`, `skiasOsAxis`, `hasCycloplegia`
  - **Subjective** (Khúc xạ chủ quan): `subjOdSph`, `subjOdCyl`, `subjOdAxis`, `subjOdVa`, `subjOsSph`, `subjOsCyl`, `subjOsAxis`, `subjOsVa`
  - **Prescription** (Kính điều chỉnh): `odSph`, `odCyl`, `odAxis`, `odVa`, `osSph`, `osCyl`, `osAxis`, `osVa`
  - **Thông số bổ sung**: `odAdd`, `osAdd`, `pd`, `lensType`, `signature`

- **Product Model**: Thêm các trường
  - `lensCategory` - Phân loại tròng: `don_trong` | `hai_trong` | `da_trong`
  - `addRange` - Độ ADD (cho 2 tròng và đa tròng)
  - `leftRegion` / `rightRegion` - Miền trái/phải

### 2. **Backend - API Routes** ✅
- ✅ `POST /api/patients` - Tự động tạo mã số thứ tự (STT001, STT002, ...) reset mỗi ngày
- ✅ `PUT /api/patients/:id` - Hỗ trợ cập nhật tất cả các trường mới
- ✅ `POST /api/refractions` - Hỗ trợ 3 loại khúc xạ + ADD + PD + loại kính + chữ ký
- ✅ `PUT /api/refractions/:id` - Cập nhật tất cả trường mới
- ✅ `GET /api/products?lensCategory=xxx` - Filter theo loại tròng
- ✅ `POST /api/products` - Hỗ trợ tạo sản phẩm với phân loại tròng
- ✅ `GET /api/stats/dashboard` - Thêm `examinationsToday` và `invoicesToday`

### 3. **Frontend - UI đã cập nhật** ✅
- ✅ **Tiếp tân (ReceptionPage)**:
  - Hiển thị cột "Mã số thứ tự" (STT)
  - Form thêm bệnh nhân có: Thị lực (OD/OS), checkbox "Có đeo kính", Lý do khám, Ghi chú
  - Xem chi tiết bệnh nhân hiển thị đầy đủ thông tin mới

- ✅ **Dashboard (DashboardPage)**:
  - Ẩn doanh thu
  - Chỉ hiển thị 3 số liệu: 
    1. Bệnh nhân khúc xạ hôm nay
    2. Khám bệnh hôm nay
    3. Hóa đơn kính hôm nay

### 4. **Hướng dẫn và Scripts** ✅
- ✅ `HUONG-DAN-CHAY-LOCAL.md` - Hướng dẫn chi tiết cách chạy local
- ✅ `start-dev.bat` - Script tự động chạy server + client

---

## ⏳ ĐANG CẦN THỰC HIỆN

### 1. **In mã số thứ tự (57mm x 50mm)** ⏳
- Cần tạo component in mã số thứ tự cho máy in nhiệt
- Template dạng:
  ```
  =========================
    PHÒNG KHÁM MẮT ABC
  =========================
    
    MÃ SỐ THỨ TỰ
    
       STT001
    
  Vui lòng chờ đến lượt
  -------------------------
  Ngày: DD/MM/YYYY HH:mm
  =========================
  ```

### 2. **Nút mời bệnh nhân với Voice** ⏳
- Thêm nút "Mời bệnh nhân" ở trang Khúc xạ và Khám bệnh
- Dùng Web Speech API để phát âm thanh: "Mời STT xxx vào phòng Khúc xạ/Khám mắt"
- Code mẫu:
  ```javascript
  const speakQueueNumber = (queueNumber, room) => {
    const utterance = new SpeechSynthesisUtterance(
      `Mời số thứ tự ${queueNumber} vào phòng ${room}`
    );
    utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  };
  ```

### 3. **UI Khúc xạ (RefractionPage)** ⏳
Cần cập nhật lớn:
- **List bệnh nhân đợi**: Hiển thị bệnh nhân có `visitStatus='waiting'` và `visitPurpose` có 'refraction'
- **Hiển thị thông tin bệnh nhân**: Mã STT, Thị lực ban đầu, Lý do khám
- **Form kết quả**: Chia thành 3 section:
  1. **Khúc xạ khách quan (Skiascopy)**: SPH/CYL/AXIS, checkbox "Liệt điều tiết"
  2. **Khúc xạ chủ quan (Subjective)**: SPH/CYL/AXIS/VA
  3. **Kính điều chỉnh (Prescription)**: SPH/CYL/AXIS/VA + ADD + PD + Loại kính
- **Nút mời bệnh nhân** với voice

### 4. **In phiếu khúc xạ (A5)** ⏳
- Tạo template in phiếu khúc xạ, kích thước A5
- Bao gồm:
  - Thông tin bệnh nhân
  - 3 loại kết quả khúc xạ (nếu có liệt điều tiết thì hiển thị)
  - Độ ADD, PD, Loại kính
  - Chữ ký bác sĩ (nếu có)
- CSS cho print media: `@media print { ... }`

### 5. **UI Khám bệnh (ExaminationPage)** ⏳
Đơn giản hóa theo yêu cầu:
- List bệnh nhân đợi khám (có `visitPurpose` chứa 'examination')
- Hiển thị: Mã STT, Thị lực, Lý do khám
- Các nút:
  - **Mời bệnh nhân** (voice)
  - **Hoàn thành khám** (xóa khỏi list, cập nhật `visitStatus='completed'`)
  - **Chuyển sang khúc xạ** (thêm 'refraction' vào `visitPurpose`)
  - **Xóa bệnh nhân**

### 6. **Trang Lịch sử khám** ⏳
- Tạo trang mới để xem lịch sử bệnh nhân cũ
- Tìm kiếm theo: Tên, SĐT, Mã BN
- Hiển thị: Lịch sử khúc xạ, khám bệnh, hóa đơn

### 7. **Chuyển gợi ý sản phẩm từ Khúc xạ sang Hóa đơn** ⏳
- Bỏ phần gợi ý sản phẩm ở trang Khúc xạ
- Khi lưu kết quả khúc xạ, cập nhật `visitStatus='in_progress'`
- Trang Hóa đơn sẽ hiển thị list bệnh nhân có kết quả khúc xạ mới
- Khi tạo hóa đơn, gợi ý sản phẩm dựa trên:
  - **Tròng kính**: Match `odSph`, `odCyl`, `odAdd` (nếu có) với `sphRange`, `cylRange`, `addRange` của product
  - **Gọng kính**: Input mã gọng, tìm kiếm trong kho

### 8. **In hóa đơn giấy nhiệt (50mm)** ⏳
- Đổi template in từ A5 sang giấy nhiệt 50mm width
- CSS: `@media print { width: 50mm; }`
- Bỏ chữ ký ở hóa đơn (chỉ giữ ở phiếu khúc xạ)

### 9. **Cập nhật Kho hàng (InventoryPage)** ⏳
- Filter thêm `lensCategory`
- Form thêm/sửa sản phẩm có dropdown chọn loại tròng
- Nếu chọn "2 tròng" hoặc "Đa tròng": Hiển thị thêm field `addRange`, `leftRegion`, `rightRegion`

---

## 📝 HƯỚNG DẪN CHẠY PROJECT

### Bước 1: Cài đặt dependencies
```bash
cd phongkham
npm install
```

### Bước 2: Update database schema
```bash
cd apps/server
npm run prisma:generate
npm run prisma:push
```

**Lưu ý**: Nếu có lỗi migration, xóa file `dev.db` và chạy lại:
```bash
rm dev.db
npm run prisma:push
npm run db:seed
```

### Bước 3: Chạy development

**Option 1 - Dùng batch file (Windows)**:
```bash
# Từ thư mục gốc phongkham
start-dev.bat
```

**Option 2 - Chạy thủ công (2 terminal)**:
```bash
# Terminal 1 - Server
cd apps/server
npm run dev

# Terminal 2 - Client  
cd apps/client
npm run dev
```

### Bước 4: Truy cập
- Client: http://localhost:5173
- Server API: http://localhost:4000
- Prisma Studio: `cd apps/server && npm run db:studio`

---

## 🚀 CÁC BƯỚC TIẾP THEO

Để hoàn thành đầy đủ tất cả yêu cầu, cần:

1. **Cập nhật RefractionPage**: Form 3 loại khúc xạ, list bệnh nhân đợi, voice
2. **Tạo component PrintQueueTicket**: In mã số thứ tự 57mm x 50mm
3. **Tạo component PrintRefractionSheet**: In phiếu khúc xạ A5
4. **Cập nhật ExaminationPage**: Đơn giản hóa, thêm voice và các nút
5. **Tạo HistoryPage**: Trang lịch sử khám
6. **Cập nhật InvoicesPage**: Gợi ý sản phẩm, in giấy nhiệt
7. **Cập nhật InventoryPage**: Filter và form theo loại tròng

Tất cả backend đã sẵn sàng, chỉ cần cập nhật UI!

---

## 📞 Liên hệ

Nếu gặp vấn đề hoặc cần hỗ trợ, kiểm tra:
1. Console logs ở terminal server
2. Browser console (F12)
3. Network tab trong DevTools
4. File `HUONG-DAN-CHAY-LOCAL.md` để biết chi tiết

**Backend API đã sẵn sàng - Frontend đang cần hoàn thiện!**


