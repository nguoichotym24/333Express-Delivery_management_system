333Express — Ung dung quan ly giao hang (FE + BE)

Tai lieu nay huong dan cai dat va chay toan bo du an tu luc clone repo, chuan bi CSDL, cau hinh moi truong den khoi chay Backend (Express) va Frontend (Next.js).

I. Yeu cau he thong

- Git
- Node.js >= 18.18 (khuyen nghi Node 20 LTS)
- Trinh quan ly goi: pnpm (khuyen nghi) hoac npm/yarn
- MySQL 8.x hoac MariaDB (co the dung XAMPP), phpMyAdmin de import nhanh

II. Cai Node.js + them vao PATH (Windows/macOS/Linux)

1. Cai Node.js LTS

- Tai tai: https://nodejs.org (chon LTS). Tren Windows, trong bo cai, tick “Add to PATH”.

2. Kiem tra PATH

- Mo terminal moi va chay:
  - `node -v` (ky vong in ra v >= 18.18)
  - `npm -v`
- Neu Windows bao “node is not recognized”: Dang xuat/dang nhap lai hoac restart terminal. Neu van khong duoc:
  - Mo “Edit the system environment variables” → Environment Variables…
  - Tai “User variables” hoac “System variables”, chon `Path` → Edit → Add: `C:\Program Files\nodejs` (hoac thu muc NodeJS ban cai) → OK.

III. Clone repo

- `git clone <repo-url>`
- `cd 333_Express`

IV. Chuan bi Database (XAMPP/MySQL)

- Mo XAMPP, Start MySQL → mo phpMyAdmin: http://localhost/phpmyadmin
- Import lan luot cac file trong thu muc `database/`:
  - `database/schema.sql` (tao DB `333express`, cac bang, rang buoc)
  - `database/seed.sql` (du lieu mau: users, warehouses, statuses, mot so orders)
  - Tuy chon cho demo:
    - `database/seed_add_warehouse_users.sql` (tao user van hanh kho neu thieu)
    - `database/seed_add_shippers.sql` (tao 2 shipper/ kho)
    - `database/seed_orders_2025_10_09_to_11_08.sql` (~60 don 09/10/2025 → 08/11/2025 de test thong ke)

Luu y MariaDB/MySQL

- Nen dung charset/collation `utf8mb4/utf8mb4_unicode_ci` de hien thi TV co dau.
- `database/patch_unique_assignment.sql` co the khong tuong thich MariaDB cu (IF NOT EXISTS). Co the bo qua vi `schema.sql` da tao unique key cho `order_assignments`.

Cai npm

- Chạy: `npm install react@18 react-dom@18`
  Sau đó:
  `npm install`
  `npm run dev`
  `npm install express`
  `npm install express node-fetch`
  `npm install leaflet`

V. Cau hinh moi truong

1. Backend (`backend/.env`):

```
PORT=4000
JWT_SECRET=change-me-super-secret
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=333express
ALLOWED_ORIGINS=http://localhost:3000
```

2. Frontend (Next.js, file `.env.local` o thu muc goc):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

- Chạy backend: `cd backend`
  `npm run dev`
- Chạy frontend: `cd 333_Expess`
  `npm run dev`

VII. Tai khoan demo (mat khau: password123)

- Admin: admin@example.com
- Warehouse: warehouse@example.com
- Shipper: shipper@example.com
- Customer: customer@example.com

VIII. Cac endpoint chinh (Backend)

- POST /auth/register — tao tai khoan khach hang
- POST /auth/login — tra ve { token, user }
- GET /auth/me — thong tin nguoi dung
- POST /orders — tao don (auth: customer/admin)
- PATCH /orders/:id/status — cap nhat trang thai (auth: warehouse/shipper/admin)
- GET /orders/public/track/:tracking — tra cuu cong khai theo ma van don
- GET /orders/:tracking/route — du lieu lo trinh cho ban do
- GET /fees/calculate?fromLat=&fromLng=&toLat=&toLng=&weightKg= — tinh phi du kien
- GET /warehouses — danh sach kho
- GET /admin/users — quan ly nguoi dung (admin)
- GET /admin/analytics — so lieu tong quan (admin)

IX. Luong trang thai

- Kiem soat qua `backend/src/constants/status.ts` (AllowedTransitions).

X. FE ↔ BE Proxy

- Next.js dung cac route proxy trong `app/api/...` de goi sang backend va doc JWT trong cookie `auth_token`.
- Co the tro truc tiep FE toi BE bang `NEXT_PUBLIC_API_BASE_URL`.

XI. Khac phuc su co

- Node version: dam bao `node -v` ≥ 18.18 neu build Next.js loi.
- DB connection: kiem tra `backend/.env`, MySQL dang chay, thong tin dang nhap dung.
- CORS: giu `ALLOWED_ORIGINS=http://localhost:3000` khi chay local.
- Port trung: doi `PORT` backend hoac dung cong khac cho FE.
