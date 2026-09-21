# Kế hoạch tối ưu Production Ready, sửa .gitignore, xóa git cache, thêm .env.example

## 1. Mục tiêu
- Sửa đổi cấu hình `.gitignore` toàn diện ở root, backend, frontend; ngăn chặn lộ lọt file môi trường và file build.
- Xóa cache git (`git rm --cached`) để loại bỏ các file nhạy cảm đang bị theo dõi (`backend/.env.development`, `backend/.env.production`).
- Tạo `.env.example` chuẩn mẫu cho cả `backend` và `frontend`.
- Tối ưu cấu hình Backend (NestJS) và Frontend (Next.js) đạt chuẩn Production Ready:
  - Bảo mật CORS, ẩn header framework (`poweredByHeader: false`).
  - Quản lý JWT secret an toàn, fail-fast nếu thiếu secret khi chạy production.
  - Hỗ trợ graceful shutdown hooks (`enableShutdownHooks`) cho môi trường container/cloud.
  - Điều khiển Swagger docs linh hoạt theo biến môi trường.
  - Chuẩn hóa đọc biến môi trường trong `ConfigModule`.

## 2. Chi tiết các bước thực hiện

### Bước 1: Chuẩn hóa `.gitignore`
- **Root `.gitignore`**: Tạo mới để bao quát toàn bộ repo monorepo:
  - `node_modules/`, `dist/`, `.next/`, `build/`, `out/`, `coverage/`
  - `.env`, `.env.*` (ngoại trừ `!.env.example`, `!.env.*.example`)
  - Log, OS files, IDE configs thừa.
- **`backend/.gitignore`**: Thêm quy tắc ignore `.env*` và ngoại lệ `!.env.example`.
- **`frontend/.gitignore`**: Bổ sung ngoại lệ `!.env.example`.

### Bước 2: Xóa git cache & untrack file nhạy cảm
- Thực hiện `git rm --cached backend/.env.development backend/.env.production`.
- Xóa git cache toàn bộ và index lại: `git rm -r --cached .` rồi `git add .` theo `.gitignore` mới.
- Kiểm tra lại `git ls-files` đảm bảo không còn file `.env*` thật nào bị track.

### Bước 3: Tạo file `.env.example`
- **`backend/.env.example`**:
  ```env
  PORT=8080
  NODE_ENV=production
  MONGODB_URI=mongodb://localhost:27017/human_management
  JWT_SECRET=replace_with_strong_jwt_secret_min_32_chars
  REFRESH_TOKEN_SECRET=replace_with_strong_refresh_token_secret_min_32_chars
  CORS_ORIGIN=http://localhost:3000
  ENABLE_SWAGGER=false
  ```
- **`frontend/.env.example`**:
  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
  ```

### Bước 4: Tối ưu Backend (NestJS) Production Ready
- **`backend/src/app.module.ts`**:
  - Đổi `envFilePath` sang chuẩn: `['.env.' + (process.env.NODE_ENV || 'development'), '.env']`.
  - Validate `MONGODB_URI` trong factory kết nối Mongoose, báo lỗi rõ nếu thiếu.
- **`backend/src/main.ts`**:
  - Kích hoạt `app.enableShutdownHooks()` để xử lý graceful shutdown trên K8s/Docker/PM2.
  - Tối ưu CORS: kiểm tra `CORS_ORIGIN`, nếu có dùng danh sách origin hoặc origin được chỉ định thay vì `origin: true` mặc định.
  - Ẩn Swagger ở production trừ khi `ENABLE_SWAGGER === 'true'`.
- **`backend/src/auth/`**:
  - Fail-fast hoặc throw error nếu chạy production mà `JWT_SECRET` hoặc `REFRESH_TOKEN_SECRET` bị thiếu hoặc dùng giá trị mặc định.

### Bước 5: Tối ưu Frontend (Next.js) Production Ready
- **`frontend/next.config.ts`**:
  - Thêm `poweredByHeader: false` nhằm ẩn header nhận diện công nghệ.
  - `reactStrictMode: true`.

### Bước 6: Kiểm tra xác minh (Verification)
- Kiểm tra `git status` và `git ls-files` xác nhận sạch cache và file nhạy cảm đã bị untrack.
- Kiểm tra các file `.env.example` và cấu hình code.
