# Hệ thống quản lý Phòng khám Mắt

Hệ thống quản lý toàn diện cho phòng khám mắt, bao gồm quản lý bệnh nhân, đo khúc xạ, khám bệnh, kho hàng và hóa đơn.

## Tính năng

### 1. Quản lý bệnh nhân (Tiếp tân)
- Đăng ký bệnh nhân mới với mã tự động
- Tìm kiếm và quản lý thông tin bệnh nhân
- Lưu trữ lịch sử khám bệnh

### 2. Đo khúc xạ
- Nhập kết quả đo khúc xạ cho cả hai mắt (SPH, CYL, AXIS, VA)
- Gợi ý sản phẩm phù hợp dựa trên kết quả đo
- Tạo đơn hàng trực tiếp từ kết quả đo

### 3. Khám bệnh
- Ghi nhận triệu chứng, chẩn đoán
- Kê đơn thuốc và phương pháp điều trị
- Lưu trữ lịch sử khám bệnh

### 4. Quản lý hóa đơn
- Tạo hóa đơn với nhiều loại (kính, khám, thuốc)
- Chữ ký điện tử
- In hóa đơn PDF
- Theo dõi trạng thái thanh toán

### 5. Quản lý kho hàng
- Quản lý sản phẩm (tròng kính, gọng kính, thuốc)
- Cảnh báo tồn kho thấp
- Cảnh báo hạn sử dụng (thuốc)
- Phân loại theo danh mục

### 6. Dashboard & Báo cáo
- Thống kê tổng quan
- Báo cáo doanh thu theo thời gian
- Phân tích hiệu suất

## Công nghệ sử dụng

### Backend
- Node.js + Express
- Prisma ORM
- SQLite Database
- Mongoose (optional)

### Frontend
- React 18
- Ant Design 5
- React Router v6
- Axios
- Day.js
- React Signature Canvas

## Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
# Cài đặt tất cả packages
npm install

# Hoặc cài đặt riêng từng phần
cd apps/server && npm install
cd apps/client && npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` trong `apps/server/`:

```env
PORT=4000
DATABASE_URL="file:./dev.db"
MONGO_URI=
CORS_ORIGIN=http://localhost:5173
```

### 3. Khởi tạo database

```bash
cd apps/server

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed dữ liệu mẫu (optional)
npm run db:seed
```

### 4. Chạy ứng dụng

#### Development mode

Mở 2 terminal:

**Terminal 1 - Backend:**
```bash
cd apps/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/client
npm run dev
```

Truy cập: http://localhost:5173

#### Production mode

```bash
# Build frontend
cd apps/client
npm run build

# Start server
cd apps/server
npm start
```

## Scripts hữu ích

### Server scripts
```bash
npm run dev              # Chạy dev server với nodemon
npm start               # Chạy production server
npm run prisma:generate # Generate Prisma client
npm run prisma:push     # Push schema changes
npm run db:studio       # Mở Prisma Studio
npm run db:seed         # Seed dữ liệu mẫu
npm run db:reset        # Reset và seed lại database
npm run backup          # Backup database
```

### Client scripts
```bash
npm run dev      # Chạy Vite dev server
npm run build    # Build production
npm run preview  # Preview production build
```

## Cấu trúc thư mục

```
phongkham/
├── apps/
│   ├── client/              # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── screens/     # Page components
│   │   │   ├── lib/         # API utilities
│   │   │   ├── routes.jsx   # Route configuration
│   │   │   └── App.jsx      # Main app component
│   │   └── package.json
│   │
│   └── server/              # Node.js backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── scripts/     # Utility scripts
│       │   ├── db.js        # Database connection
│       │   └── index.js     # Main server file
│       ├── prisma/
│       │   └── schema.prisma # Database schema
│       └── package.json
│
├── package.json             # Root package.json
└── README.md
```

## API Endpoints

### Patients
- `GET /api/patients` - Lấy danh sách bệnh nhân
- `GET /api/patients/:id` - Lấy thông tin bệnh nhân
- `POST /api/patients` - Tạo bệnh nhân mới
- `PUT /api/patients/:id` - Cập nhật bệnh nhân
- `DELETE /api/patients/:id` - Xóa bệnh nhân

### Refractions
- `GET /api/refractions` - Lấy danh sách khúc xạ
- `POST /api/refractions` - Tạo kết quả khúc xạ
- `PUT /api/refractions/:id` - Cập nhật khúc xạ
- `DELETE /api/refractions/:id` - Xóa khúc xạ

### Examinations
- `GET /api/examinations` - Lấy danh sách khám bệnh
- `POST /api/examinations` - Tạo phiếu khám
- `PUT /api/examinations/:id` - Cập nhật phiếu khám
- `DELETE /api/examinations/:id` - Xóa phiếu khám

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Invoices
- `GET /api/invoices` - Lấy danh sách hóa đơn
- `POST /api/invoices` - Tạo hóa đơn mới
- `PATCH /api/invoices/:id/status` - Cập nhật trạng thái
- `PATCH /api/invoices/:id/signature` - Lưu chữ ký
- `DELETE /api/invoices/:id` - Xóa hóa đơn

### Statistics
- `GET /api/stats/dashboard` - Thống kê dashboard
- `GET /api/stats/revenue/monthly` - Doanh thu theo tháng
- `GET /api/stats/products/categories` - Phân bổ sản phẩm

## Tài liệu tham khảo

- Dựa trên tài liệu yêu cầu: "Chương trình quản lý phòng khám"
- Workflow: Tiếp tân → Khúc xạ → Khám bệnh → Tạo đơn hàng → Hóa đơn
- Hỗ trợ cảnh báo tồn kho và hạn sử dụng

## Ghi chú

- Hệ thống sử dụng SQLite để dễ dàng triển khai
- Tích hợp sẵn chữ ký điện tử cho hóa đơn
- Responsive design, hoạt động tốt trên mobile
- Hỗ trợ in hóa đơn PDF

## License

MIT
