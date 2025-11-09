333Express — Ứng dụng quản lý giao hàng (FE + BE)

Tài liệu này hướng dẫn cài đặt và chạy toàn bộ dự án từ lúc clone repo, chuẩn bị CSDL, cấu hình môi trường đến khởi chạy Backend (Express) và Frontend (Next.js).

Yêu cầu hệ thống
- Git, Node.js ≥ 18.18 (khuyến nghị Node 20 LTS)
- Trình quản lý gói: pnpm (khuyến nghị) hoặc npm/yarn
- MySQL 8.x hoặc MariaDB (XAMPP), phpMyAdmin để import nhanh

1) Clone dự án
- git clone <repo-url>
- cd 333_Express

2) Chuẩn bị Database (XAMPP/MySQL)
- Mở XAMPP, Start MySQL → vào phpMyAdmin: http://localhost/phpmyadmin
- Import lần lượt các file trong thư mục database/:
  - database/schema.sql (tạo DB 333express, bảng và ràng buộc)
  - database/seed.sql (dữ liệu mẫu: người dùng, kho, trạng thái, một số đơn hàng)
  - Tùy chọn demo bổ sung:
    - database/seed_add_warehouse_users.sql (tạo user vận hành kho nếu thiếu)
    - database/seed_add_shippers.sql (tạo 2 shipper cho mỗi kho)
    - database/seed_orders_2025_10_09_to_11_08.sql (~60 đơn 09/10/2025 → 08/11/2025 để test thống kê)

Lưu ý MariaDB/MySQL
- Thiết lập charset/collation utf8mb4/utf8mb4_unicode_ci cho DB nếu gặp lỗi hiển thị tiếng Việt.
- File database/patch_unique_assignment.sql có thể không tương thích MariaDB cũ (IF NOT EXISTS). Có thể bỏ qua vì schema.sql đã tạo unique key cho order_assignments.

3) Cấu hình môi trường
- Backend: chỉnh backend/.env (đã có trong repo, cập nhật khi cần):
  - PORT=4000
  - JWT_SECRET=change-me-super-secret
  - DB_HOST=127.0.0.1
  - DB_PORT=3306
  - DB_USER=root
  - DB_PASSWORD= (để trống nếu XAMPP mặc định)
  - DB_NAME=333express
  - ALLOWED_ORIGINS=http://localhost:3000
- Frontend (Next.js): tạo file .env.local ở thư mục gốc:
  - NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

4) Cài dependencies và chạy dự án
- Backend (Express):
  - cd backend
  - pnpm i (hoặc npm i/yarn)
  - pnpm dev → http://localhost:4000
- Frontend (Next.js):
  - cd .. (về thư mục gốc)
  - pnpm i (hoặc npm i/yarn)
  - pnpm dev → http://localhost:3000

5) Tài khoản demo (mật khẩu mặc định password123)
- Admin: admin@example.com
- Warehouse: warehouse@example.com
- Shipper: shipper@example.com
- Customer: customer@example.com

Các endpoint chính (Backend)
- POST /auth/register — tạo tài khoản khách hàng
- POST /auth/login — trả về { token, user }
- GET /auth/me — thông tin người dùng đăng nhập
- POST /orders — tạo đơn (auth: customer/admin)
- PATCH /orders/:id/status — cập nhật trạng thái (auth: warehouse/shipper/admin)
- GET /orders/public/track/:tracking — tra cứu công khai theo mã vận đơn
- GET /orders/:tracking/route — dữ liệu lộ trình cho bản đồ
- GET /fees/calculate?fromLat=&fromLng=&toLat=&toLng=&weightKg= — tính phí dự kiến
- GET /warehouses — danh sách kho
- GET /admin/users — quản lý người dùng (admin)
- GET /admin/analytics — số liệu tổng quan (admin)

Luồng trạng thái
- Kiểm soát qua backend/src/constants/status.ts (AllowedTransitions).

Ghi chú tích hợp FE ↔ BE
- Next.js dùng các route proxy trong app/api/... để gọi sang backend và đọc JWT từ cookie auth_token.
- Có thể trỏ trực tiếp FE tới BE bằng cách đặt NEXT_PUBLIC_API_BASE_URL.

Khắc phục sự cố thường gặp
- Node version: đảm bảo node -v ≥ 18.18 nếu build Next.js lỗi.
- DB connection: kiểm tra backend/.env, MySQL đang chạy, tài khoản/port đúng.
- CORS: ALLOWED_ORIGINS=http://localhost:3000 khi chạy local.
- Port trùng: đổi PORT backend hoặc dừng tiến trình chiếm cổng 3000/4000.
