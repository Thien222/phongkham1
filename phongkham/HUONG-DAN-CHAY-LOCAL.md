# Hướng dẫn chạy dự án ở Local (Development Mode)

## Thay đổi mới trong phiên bản này

### 1. Database Schema
- **Patient (Bệnh nhân)**: Thêm trường thị lực ban đầu, có kính, lý do khám, ghi chú, mã số thứ tự
- **Refraction (Khúc xạ)**: Chia thành 3 loại (Skiascopy, Subjective, Prescription), thêm độ ADD, PD, loại kính, chữ ký
- **Product (Sản phẩm)**: Thêm phân loại tròng (đơn/2 tròng/đa tròng), độ ADD, miền trái/phải

### 2. API Routes
- Tất cả các API đã được cập nhật để hỗ trợ các trường mới
- Mã số thứ tự (queue number) tự động tạo và reset mỗi ngày

## Các bước chạy dự án

### Bước 1: Cài đặt dependencies

Dự án sử dụng **npm workspaces**, chỉ cần chạy một lần ở thư mục gốc:

```bash
cd phongkham
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` trong `apps/server/`:

```env
PORT=4000
DATABASE_URL="file:./dev.db"
MONGO_URI=
CORS_ORIGIN=http://localhost:5173
```

### Bước 3: Cập nhật Database Schema

**QUAN TRỌNG**: Schema đã thay đổi, cần chạy các lệnh sau:

```bash
cd apps/server

# Generate Prisma Client với schema mới
npm run prisma:generate

# Push schema mới vào database
npm run prisma:push
```

**Lưu ý**: Nếu bạn đã có database cũ, lệnh `prisma:push` sẽ cố gắng migrate dữ liệu. Các trường mới sẽ có giá trị mặc định hoặc null.

### Bước 4: Chạy Server và Client

Mở **2 terminal**:

#### Terminal 1 - Server (Backend):
```bash
cd apps/server
npm run dev
```

Server chạy tại: **http://localhost:4000**

#### Terminal 2 - Client (Frontend):
```bash
cd apps/client
npm run dev
```

Client chạy tại: **http://localhost:5173**

### Bước 5: Truy cập ứng dụng

Mở trình duyệt: **http://localhost:5173**

---

## Cách chạy nhanh với file .bat

Chạy file **`start-dev.bat`** (tự động mở 2 cửa sổ cho server và client)

---

## Các thay đổi chi tiết

### Patient Model (Bệnh nhân)
```javascript
{
  queueNumber: "STT001",      // Mã số thứ tự (reset mỗi ngày)
  initialVaOd: "10/10",       // Thị lực mắt phải ban đầu
  initialVaOs: "10/10",       // Thị lực mắt trái ban đầu
  hasGlasses: false,          // Có đeo kính không
  visitReason: "Đau mắt",     // Lý do đến khám
  notes: "Ghi chú"            // Ghi chú
}
```

### Refraction Model (Khúc xạ)
```javascript
{
  // 1. Khúc xạ khách quan (Skiascopy)
  skiasOdSph, skiasOdCyl, skiasOdAxis,
  skiasOsSph, skiasOsCyl, skiasOsAxis,
  hasCycloplegia: false,      // Có liệt điều tiết không
  
  // 2. Khúc xạ chủ quan (Subjective)
  subjOdSph, subjOdCyl, subjOdAxis, subjOdVa,
  subjOsSph, subjOsCyl, subjOsAxis, subjOsVa,
  
  // 3. Kính điều chỉnh (Prescription)
  odSph, odCyl, odAxis, odVa,
  osSph, osCyl, osAxis, osVa,
  
  // Thông số bổ sung
  odAdd: "+2.00",            // Độ ADD mắt phải
  osAdd: "+2.00",            // Độ ADD mắt trái
  pd: "62mm",                // Khoảng cách đồng tử
  lensType: "da_trong",      // Loại kính: da_trong | hai_trong | don_trong_xa | don_trong_gan
  signature: "base64..."      // Chữ ký bác sĩ (Base64)
}
```

### Product Model (Sản phẩm)
```javascript
{
  lensCategory: "da_trong",   // Phân loại: don_trong | hai_trong | da_trong
  addRange: "+1.00 to +3.00", // Độ ADD (cho 2 tròng và đa tròng)
  leftRegion: "Text",         // Miền bên trái (cho 2 tròng, đa tròng)
  rightRegion: "Text"         // Miền bên phải (cho 2 tròng, đa tròng)
}
```

---

## API Endpoints mới/cập nhật

### Patients
- `POST /api/patients` - Tạo bệnh nhân (tự động tạo mã số thứ tự)
  ```json
  {
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "initialVaOd": "10/10",
    "initialVaOs": "10/10",
    "hasGlasses": false,
    "visitReason": "Đau mắt",
    "notes": "Ghi chú"
  }
  ```

### Refractions
- `POST /api/refractions` - Tạo kết quả khúc xạ (hỗ trợ 3 loại)
  ```json
  {
    "patientId": "xxx",
    "skiasOdSph": "-2.00",
    "subjOdSph": "-1.75",
    "odSph": "-2.00",
    "odAdd": "+2.00",
    "pd": "62mm",
    "lensType": "da_trong",
    "hasCycloplegia": false,
    "signature": "base64..."
  }
  ```

### Products
- `GET /api/products?lensCategory=da_trong` - Filter theo loại tròng
- `POST /api/products` - Tạo sản phẩm
  ```json
  {
    "code": "TRONG001",
    "name": "Tròng đa tròng",
    "category": "lenses",
    "lensCategory": "da_trong",
    "sphRange": "-10.00 to +6.00",
    "cylRange": "0 to -6.00",
    "addRange": "+1.00 to +3.00",
    "leftRegion": "Miền trái",
    "rightRegion": "Miền phải"
  }
  ```

---

## Scripts hữu ích

### Server (`apps/server/`)
```bash
npm run dev              # Dev server với nodemon
npm start               # Production server
npm run prisma:generate # Generate Prisma Client
npm run prisma:push     # Push schema vào DB
npm run db:studio       # Mở Prisma Studio (GUI)
npm run db:seed         # Seed dữ liệu mẫu
npm run db:reset        # Reset và seed lại DB
```

### Client (`apps/client/`)
```bash
npm run dev      # Dev server (Vite)
npm run build    # Build production
npm run preview  # Preview production build
```

---

## Troubleshooting

### Lỗi Prisma Client
```bash
cd apps/server
npm run prisma:generate
```

### Database migration error
```bash
cd apps/server
# Option 1: Force push (cẩn thận - sẽ mất dữ liệu)
npx prisma db push --force-reset

# Option 2: Xóa file dev.db và tạo mới
rm dev.db
npm run prisma:push
npm run db:seed
```

### Port bị chiếm
- Thay đổi PORT trong `.env` (server)
- Thay đổi port trong `vite.config.js` (client)

---

## Các tính năng UI cần cập nhật (WIP)

**Backend đã sẵn sàng**, nhưng UI cần cập nhật để hiển thị và sử dụng các trường mới:

1. ✅ Schema Database - DONE
2. ✅ API Routes - DONE
3. ⏳ UI Tiếp tân - Thêm form fields mới
4. ⏳ UI Khúc xạ - 3 loại khúc xạ, ADD, PD, loại kính
5. ⏳ In phiếu khúc xạ (A5)
6. ⏳ In mã số thứ tự (57mm x 50mm)
7. ⏳ Voice mời bệnh nhân
8. ⏳ Dashboard - Ẩn doanh thu
9. ⏳ UI Khám bệnh - Simplified
10. ⏳ Lịch sử khám

---

## Liên hệ

Nếu có vấn đề, kiểm tra:
1. Console logs ở terminal server
2. Browser console (F12)
3. Network tab trong DevTools
