# Kế hoạch cải thiện nâng cao (Further Improvements)

## 1. Mục tiêu
Tiếp tục nâng cấp trải nghiệm lập trình, bảo mật API và trải nghiệm người dùng (UX) cho cả Backend và Frontend.

---

## 2. Chi tiết các hạng mục cải tiến

### Hạng mục 1: Backend Global Exception Filter (Xử lý lỗi cơ sở dữ liệu chuyên nghiệp)
- **Vấn đề hiện tại**:
  - Khi người dùng tạo trùng dữ liệu (mã lỗi MongoDB `11000` như `username`, `email`, `maPhieuThu`), NestJS ném uncaught exception và trả về HTTP `500 Internal Server Error`.
  - Khi truyền sai định dạng MongoDB ObjectId (ví dụ: `id` rác), ném `CastError` trả về 500.
- **Giải pháp**:
  - Tạo `AllExceptionsFilter` (`backend/src/common/filters/all-exceptions.filter.ts`):
    - Mã lỗi `11000`: Bắt tên field bị trùng, trả HTTP `409 Conflict` với thông báo tiếng Việt rõ ràng: `Trường [field] đã tồn tại trong hệ thống`.
    - Lỗi `CastError`: Trả HTTP `400 Bad Request`: `ID không đúng định dạng MongoDB ObjectId`.
    - Lỗi khác: Giữ nguyên `HttpException`, hoặc trả `500` nhưng ẩn stack trace khi ở `NODE_ENV === 'production'`.
  - Đăng ký filter toàn cục trong `backend/src/main.ts` qua `app.useGlobalFilters(new AllExceptionsFilter(configService))`.

### Hạng mục 2: Frontend Route Protection / Auth Guard (Bảo vệ tuyến đường)
- **Vấn đề hiện tại**:
  - Khi người dùng chưa đăng nhập truy cập trực tiếp vào `/nhan-khau`, `/ho-khau`, `/thu-phi`... giao diện vẫn render, gửi API dồn dập, nhận lỗi 401 hàng loạt và người dùng bị kẹt ở màn hình trống.
  - Khi đã đăng nhập thành công nhưng vào lại `/auth/login` vẫn mở form đăng nhập.
- **Giải pháp**:
  - Cập nhật `Bootstrap.tsx` và `MainLayout.tsx` (hoặc Client Auth Guard):
    - Nếu `ready === true` mà `!user` và đường dẫn không thuộc `/auth/*` -> `router.replace('/auth/login')`.
    - Nếu `ready === true` và `user !== null` và đang ở `/auth/login` hoặc `/auth/register` -> `router.replace('/')`.

### Hạng mục 3: Backend Body Parser Limit (Chống DoS Payload)
- **Vấn đề hiện tại**:
  - Chưa cấu hình giới hạn kích thước request body trong Express, kẻ tấn công có thể gửi payload hàng trăm MB gây nghẽn RAM (Memory Exhaustion DoS).
- **Giải pháp**:
  - Trong `backend/src/main.ts`:
    - Cấu hình `express.json({ limit: '10mb' })` và `express.urlencoded({ extended: true, limit: '10mb' })`.

### Hạng mục 4: Frontend Next Font Optimization (Tiết kiệm ~10MB static files)
- **Vấn đề hiện tại**:
  - Thư mục `frontend/src/fonts/` chứa 64 file font tĩnh (`.eot`, `.ttf`, `.woff`, `.woff2`) nặng gần 10MB nhưng chỉ dùng một phần.
  - Sử dụng `@import "../css/nunito.css"` truyền thống gây nguy cơ Flash of Unstyled Text (FOUT) / Flash of Invisible Text (FOIT).
- **Giải pháp**:
  - Chuyển sang `next/font/google`:
    ```typescript
    import { Nunito } from 'next/font/google';
    const nunito = Nunito({ subsets: ['latin', 'vietnamese'], variable: '--font-nunito' });
    ```
  - Cập nhật font trong `globals.css`.
  - Dọn dẹp thư mục fonts tĩnh cũ để giảm dung lượng repository.

---

## 3. Kế hoạch kiểm thử & Xác minh
- Viết runnable test kiểm tra:
  - Global filter bắt đúng lỗi `11000` và `CastError`.
  - Body parser limit được áp dụng.
  - Route guard redirect đúng điều kiện.
