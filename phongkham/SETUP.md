# Hướng dẫn cài đặt và chạy hệ thống

## Bước 1: Cài đặt Dependencies

```bash
# Cài đặt cho server
cd apps/server
npm install

# Cài đặt cho client
cd ../client
npm install
```

## Bước 2: Khởi tạo Database

```bash
cd apps/server

# Generate Prisma Client
npm run prisma:generate

# Tạo database và push schema
npm run prisma:push

# Seed dữ liệu mẫu (tùy chọn)
npm run db:seed
```

## Bước 3: Chạy ứng dụng

### Chạy Development Mode (khuyến nghị)

Mở 2 terminal:

**Terminal 1 - Chạy Backend:**
```bash
cd apps/server
npm run dev
```
Server sẽ chạy tại: http://localhost:4000

**Terminal 2 - Chạy Frontend:**
```bash
cd apps/client
npm run dev
```
Client sẽ chạy tại: http://localhost:5173

Mở trình duyệt và truy cập: **http://localhost:5173**

## Kiểm tra Database

Bạn có thể mở Prisma Studio để xem và quản lý database:

```bash
cd apps/server
npm run db:studio
```

Prisma Studio sẽ mở tại: http://localhost:5555

## Các lệnh hữu ích

### Server Commands
```bash
npm run dev              # Chạy dev server với nodemon (auto-reload)
npm start               # Chạy production server
npm run prisma:generate # Generate Prisma client
npm run prisma:push     # Push schema changes to database
npm run db:studio       # Mở Prisma Studio
npm run db:seed         # Seed dữ liệu mẫu
npm run db:reset        # Reset database và seed lại
```

### Client Commands
```bash
npm run dev      # Chạy Vite dev server
npm run build    # Build production
npm run preview  # Preview production build
```

## Dữ liệu mẫu

Sau khi chạy `npm run db:seed`, hệ thống sẽ tạo:
- 3 bệnh nhân mẫu
- 4 sản phẩm (tròng kính, gọng kính, thuốc)
- Kết quả đo khúc xạ mẫu
- Phiếu khám mẫu
- 2 hóa đơn mẫu

## Xử lý lỗi thường gặp

### Lỗi: Port đã được sử dụng
```bash
# Thay đổi port trong file .env (server)
PORT=4001

# Hoặc thay đổi port trong vite.config.js (client)
server: { port: 5174 }
```

### Lỗi: Cannot find module '@prisma/client'
```bash
cd apps/server
npm run prisma:generate
```

### Lỗi: Database file not found
```bash
cd apps/server
npm run prisma:push
```

## Cấu trúc Workflow

1. **Tiếp tân** - Đăng ký bệnh nhân mới
2. **Đo khúc xạ** - Nhập kết quả đo mắt
3. **Khám bệnh** - Ghi nhận chẩn đoán
4. **Tạo hóa đơn** - Từ kết quả đo khúc xạ
5. **Quản lý kho** - Theo dõi tồn kho và hạn sử dụng

## Tính năng chính

✅ Quản lý bệnh nhân với mã tự động
✅ Đo và lưu kết quả khúc xạ
✅ Gợi ý sản phẩm dựa trên kết quả đo
✅ Tạo và quản lý hóa đơn
✅ Chữ ký điện tử
✅ In hóa đơn PDF
✅ Cảnh báo tồn kho thấp
✅ Cảnh báo hạn sử dụng thuốc
✅ Dashboard thống kê
✅ Báo cáo doanh thu

Chúc bạn sử dụng hệ thống hiệu quả! 🎉

