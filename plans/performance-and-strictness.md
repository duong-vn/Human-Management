# Kế hoạch tối ưu Performance và Tính Chặt Chẽ (Strictness)

## 1. Mục tiêu
Nâng cao tốc độ xử lý, giảm tải CPU/RAM, triệt tiêu các lỗi tiềm ẩn và chuẩn hóa kiểu dữ liệu nghiêm ngặt (Strict TypeScript) cho cả Backend và Frontend.

---

## 2. Các hạng mục cải tiến

### A. Backend - Performance & Database Indexing
1. **Đánh chỉ mục (Indexes) trên MongoDB Schema**:
   - `NhanKhauSchema`:
     - Index `{ 'soDinhDanh.so': 1 }` (sparse: true) - tăng tốc tìm kiếm CCCD/CMND.
     - Index `{ hoKhauId: 1 }` - tăng tốc tìm nhân khẩu theo hộ khẩu.
     - Index `{ trangThai: 1 }` - tăng tốc lọc trạng thái (thường trú, tạm trú, chuyển đi...).
   - `HoKhauSchema`:
     - Index `{ chuHo: 1 }` - tăng tốc tra cứu chủ hộ.
     - Index `{ trangThai: 1 }` - tăng tốc lọc hộ khẩu hoạt động/xóa.
     - Index `{ 'thanhVien.nhanKhauId': 1 }` - tăng tốc kiểm tra thành viên hộ.
   - `ThuPhiSchema`:
     - Index `{ hoKhauId: 1 }` - tìm các đợt thu theo hộ.
     - Index `{ nam: 1, trangThai: 1 }` - tăng tốc thống kê và lọc trạng thái thu phí theo năm.
     - Index `{ 'chiTietThu.khoanThuId': 1 }` - lọc theo khoản thu cụ thể.
   - `TamTruTamVangSchema`:
     - Index `{ nhanKhauId: 1 }`, `{ loai: 1, trangThai: 1 }`.
   - `KhoanThuSchema`:
     - Index `{ loaiKhoanThu: 1, isActive: 1 }`.

2. **Áp dụng `.lean()` cho các truy vấn chỉ đọc**:
   - Thêm `.lean()` vào toàn bộ các phương thức `findAll`, `findOne`, `findByCCCD`, `findByHoKhau` ở các service (`nhan-khau`, `ho-khau`, `thu-phi`, `khoan-thu`, `tam-tru-tam-vang`, `users`).
   - Bỏ qua hydration overhead của Mongoose Document -> Giảm 5-10x CPU và RAM khi load danh sách lớn.

3. **Sửa lỗi logic tìm kiếm hộ khẩu theo tên chủ hộ (`HoKhauService.findAll`)**:
   - Trường `chuHo` là `ObjectId` ref tới `NhanKhau`, câu lệnh query trực tiếp `chuHo.hoTen` qua Mongoose filter không khớp.
   - Sửa lại: Tra cứu trước danh sách `_id` từ `NhanKhau` có tên khớp từ khóa, sau đó lọc `{ chuHo: { $in: matchingIds } }` hoặc xử lý chuẩn xác.
   - Xóa `console.log` dư thừa.

### B. Backend - Tính Chặt Chẽ (Strict TypeScript & Type Safety)
1. **Loại bỏ `any` trong Query Filter**:
   - Thay `const filter: any = {};` bằng `FilterQuery<DocumentType>` từ `mongoose`.
2. **Chuẩn hóa kiểu cho Authentication**:
   - Tạo `interface JwtPayload { sub: string; username: string; role: string; }`.
   - Thay thế `user: any`, `payload: any` trong `auth.service.ts` và `jwt.strategy.ts`.
   - Sửa chính tả biến `refrest_token` -> `refreshToken`.

### C. Frontend - Performance & Rendering
1. **Sửa lỗi DOM lồng thẻ `<html>` và `<body>` ở `Providers.tsx`**:
   - Hiện tại `Providers.tsx` trả về `<html><body>...</body></html>`, được bọc bên trong `layout.tsx` (cũng có `<html><body>`).
   - Lỗi này gây React hydration error, layout flickering và làm chậm first paint.
   - Sửa: `Providers` chỉ trả về `<QueryClientProvider>`.
2. **Cấu hình React Query Cache thông minh**:
   - Đặt `staleTime: 60 * 1000` (1 phút), `gcTime: 5 * 60 * 1000` (5 phút), `refetchOnWindowFocus: false`.
   - Loại bỏ các request lặp vô ích mỗi khi người dùng đổi tab trình duyệt.
3. **Loại bỏ CSS Wildcard Transition làm lag giao diện**:
   - Trong `globals.css`: xóa bỏ `* { transition: ... }`.
   - Chuyển transition về các phần tử tương tác thực tế (`button, a, input, select, .card-hover`) để tránh trình duyệt phải tính toán lại layout toàn bộ DOM tree trên mỗi frame.

---

## 3. Kế hoạch xác minh (Verification)
- Viết test script tự động `scripts/verify-performance-strictness.mjs` kiểm tra:
  - Tất cả Mongoose schema có index đầy đủ.
  - Không còn `<html>` lồng trong `Providers.tsx`.
  - Không còn `* { transition: ... }` trong `globals.css`.
  - Kiểm tra `tsc` hoặc lint nếu có.
