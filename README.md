# Basic App — Guestbook (Next.js + Node.js + MySQL)

Dự án full-stack siêu nhỏ để thử **deploy lên public**. Một trang Guestbook đơn giản:
nhập tên + lời nhắn, lưu vào MySQL, hiển thị danh sách.

```
basic-app-devops/
├── backend/            # Node.js + Express + MySQL (có Dockerfile)
│   ├── src/
│   │   ├── index.js    # API: /api/health, GET/POST /api/messages
│   │   └── db.js       # Kết nối MySQL + tự tạo bảng (có retry)
│   ├── db/init.sql     # Schema (chạy lần đầu khi tạo container MySQL)
│   ├── Dockerfile
│   └── .env.example
├── frontend/                # Next.js (App Router) + Dockerfile
│   └── app/page.js          # Giao diện guestbook
├── docker-compose.yml       # DEV — chỉ MySQL
└── docker-compose.prod.yml  # PROD — frontend + backend + db
```

## Chạy local

Chỉ **MySQL chạy trong Docker**; Backend và Frontend chạy bằng npm.

```bash
# 1) MySQL qua docker-compose
docker compose up -d
#    → MySQL: localhost:3309 (user root / pass password / db appdb)
#    Dừng: docker compose down   (thêm -v để xoá luôn dữ liệu)

# 2) Backend (terminal mới)
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000  →  /api/health để kiểm tra

# 3) Frontend (terminal khác)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev        # http://localhost:3000
```

Backend đọc cấu hình DB từ `.env` (mặc định trỏ tới `localhost:3309`), và tự
tạo bảng `messages` khi khởi động (có retry chờ MySQL sẵn sàng).

## Chạy cả 3 service cùng lúc (prod)

Dùng `docker-compose.prod.yml` — dựng và chạy frontend + backend + db:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:4000/api/health
- DB chỉ truy cập nội bộ (không mở cổng ra host).

Override cấu hình khi deploy thật (mật khẩu, URL API public):

```bash
cp .env.prod.example .env.prod          # rồi chỉnh DB_PASSWORD, NEXT_PUBLIC_API_URL...
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Tắt: `docker compose -f docker-compose.prod.yml down` (thêm `-v` để xoá dữ liệu).

> `NEXT_PUBLIC_API_URL` được nướng vào lúc **build** frontend, nên khi đổi URL
> backend phải build lại (`--build`).

## API

| Method | Endpoint         | Mô tả                          |
|--------|------------------|--------------------------------|
| GET    | `/api/health`    | Kiểm tra sống                  |
| GET    | `/api/messages`  | Lấy 100 lời nhắn mới nhất      |
| POST   | `/api/messages`  | Tạo lời nhắn `{author, content}` |

## Deploy lên public

Kiến trúc gồm 3 phần: **Frontend**, **Backend**, **MySQL**. Một vài cách phổ biến:

### Render / Railway / Fly.io (dễ nhất cho người mới)
1. Push code lên GitHub.
2. **MySQL**: tạo một managed MySQL (Railway có sẵn; Render dùng PostgreSQL nên với MySQL hãy dùng Railway/PlanetScale/Aiven).
3. **Backend**: deploy từ thư mục `backend/` (các nền tảng tự nhận `Dockerfile`).
   Đặt biến môi trường: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`.
4. **Frontend**: deploy `frontend/` lên **Vercel** (tối ưu cho Next.js) hoặc bằng Docker.
   Đặt `NEXT_PUBLIC_API_URL` = URL public của backend (vd: `https://your-backend.onrailway.app`).
   Lưu ý: biến này được "nướng" vào lúc **build**, nên đổi URL thì phải build lại.

### Một VPS bất kỳ (DigitalOcean, EC2, ...)
1. Cài Docker + Docker Compose.
2. `git clone` repo, sửa mật khẩu trong `docker-compose.yml`.
3. Sửa `NEXT_PUBLIC_API_URL` trong compose thành domain/IP công khai của backend.
4. `docker compose up -d --build`.
5. (Khuyên dùng) đặt Nginx/Caddy phía trước để có HTTPS.

> Trước khi public: đổi `MYSQL_ROOT_PASSWORD`/`DB_PASSWORD` thành mật khẩu mạnh,
> và cân nhắc **không** mở cổng 3306 ra ngoài internet.
