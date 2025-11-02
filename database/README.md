Database setup for 333_Express (MySQL, XAMPP)

1) Chuẩn bị MySQL (XAMPP)
- Mở XAMPP Control Panel, bật dịch vụ MySQL.
- Truy cập phpMyAdmin: http://localhost/phpmyadmin

2) Tạo database và bảng
- Cách 1: Import trực tiếp file `database/schema.sql` (file này đã tạo DB `333express`).
- Cách 2: Tạo DB thủ công tên `333express` với charset `utf8mb4` và collation `utf8mb4_unicode_ci`, sau đó import `schema.sql`.

3) Seed dữ liệu mẫu
- Import `database/seed.sql` để thêm kho, người dùng, luật tính phí và 1 đơn mẫu.

4) Cấu hình backend
- Sao chép `backend/.env.example` thành `backend/.env` và chỉnh thông tin kết nối:
  - `DB_HOST=127.0.0.1`
  - `DB_PORT=3306`
  - `DB_USER=root`
  - `DB_PASSWORD=` (để trống nếu XAMPP mặc định không đặt mật khẩu)
  - `DB_NAME=333express`

5) Ghi chú
- Múi giờ: seed dùng UTC; hiển thị điều chỉnh ở tầng ứng dụng nếu cần.
- Mật khẩu seed: tất cả user có mật khẩu `password123` (đã băm trong DB).
- Nếu gặp lỗi collation/tiếng Việt, đảm bảo server và DB dùng `utf8mb4/utf8mb4_unicode_ci`.
