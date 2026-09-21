# Hệ thống Quản lý Nhân khẩu - Frontend

## 🎯 Giới thiệu

Giao diện người dùng cho hệ thống quản lý hộ khẩu, nhân khẩu và thu phí. Được xây dựng với Next.js 15, React 19 và Tailwind CSS.

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/                    # App Router của Next.js
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Trang chủ / Dashboard
│   │   ├── auth/               # Các trang xác thực
│   │   │   ├── login/          # Trang đăng nhập
│   │   │   └── register/       # Trang đăng ký
│   │   ├── ho-khau/            # Quản lý hộ khẩu
│   │   ├── nhan-khau/          # Quản lý nhân khẩu
│   │   ├── thu-phi/            # Quản lý thu phí
│   │   ├── phieu-thu/          # Quản lý phiếu thu
│   │   └── thong-ke/           # Thống kê & báo cáo
│   └── components/             # Các component tái sử dụng
│       ├── Navbar.tsx          # Thanh điều hướng trên cùng
│       ├── Sidebar.tsx         # Thanh điều hướng bên trái
│       └── MainLayout.tsx      # Layout chính
```

## 🚀 Các trang đã tạo

### 1. **Trang chủ (Homepage)** - `/`

- Dashboard với thống kê tổng quan
- Thẻ hiển thị số liệu (Hộ khẩu, Nhân khẩu, Thu phí)
- Hoạt động gần đây
- Thao tác nhanh
- Banner báo cáo thống kê

### 2. **Đăng nhập** - `/auth/login`

- Form đăng nhập với email và mật khẩu
- Ghi nhớ đăng nhập
- Link quên mật khẩu
- Link đăng ký

### 3. **Đăng ký** - `/auth/register`

- Form đăng ký tài khoản mới
- Các trường: Họ tên, Email, SĐT, Mật khẩu
- Xác nhận mật khẩu
- Chấp nhận điều khoản

### 4. **Quản lý Hộ khẩu** - `/ho-khau`

- Bảng danh sách hộ khẩu
- Tìm kiếm và lọc theo trạng thái, quận/huyện
- Thống kê tổng quan
- Các thao tác: Xem, Sửa, Xóa
- Phân trang

### 5. **Quản lý Nhân khẩu** - `/nhan-khau`

- Bảng danh sách nhân khẩu
- Tìm kiếm theo tên, CCCD
- Lọc theo giới tính, trạng thái
- Hiển thị thông tin chi tiết
- Phân trang

### 6. **Quản lý Thu phí** - `/thu-phi`

- Hiển thị dạng thẻ (cards)
- Thông tin khoản thu chi tiết
- Lọc theo loại phí, trạng thái
- Thống kê tổng quan
- Các thao tác: Chi tiết, Chỉnh sửa, Xóa

### 7. **Quản lý Phiếu thu** - `/phieu-thu`

- Bảng danh sách phiếu thu
- Tìm kiếm theo mã phiếu, hộ khẩu
- Lọc theo trạng thái, kỳ thu
- Thao tác thu tiền cho phiếu chưa thanh toán
- In phiếu thu
- Phân trang

### 8. **Thống kê & Báo cáo** - `/thong-ke`

- Thẻ thống kê nhanh với biểu đồ tăng trưởng
- Placeholder cho biểu đồ
- Các loại báo cáo có sẵn
- Xuất báo cáo Excel/PDF

## 🎨 Thiết kế giao diện

### Layout chính

- **Navbar**: Cố định ở trên cùng, hiển thị logo và nút đăng nhập/đăng ký
- **Sidebar**: Bên trái, menu điều hướng với icon
- **Main Content**: Bên phải, nội dung chính của từng trang
- **Ẩn Sidebar**: Tự động ẩn trên các trang xác thực (login/register)

### Màu sắc theo chức năng

- 🔵 **Blue** - Hộ khẩu & Trang chủ
- 🟢 **Green** - Nhân khẩu & Đăng ký
- 🟡 **Yellow** - Thu phí
- 🟣 **Purple** - Phiếu thu
- 🔴 **Red** - Cảnh báo & Chưa thanh toán

### Tính năng responsive

- Mobile-first design
- Grid layout tự động điều chỉnh
- Bảng có thanh cuộn ngang trên mobile

## 📋 Route Structure

```
/                    → Trang chủ (Dashboard)
/auth/login          → Đăng nhập
/auth/register       → Đăng ký
/ho-khau             → Quản lý Hộ khẩu
/nhan-khau           → Quản lý Nhân khẩu
/thu-phi             → Quản lý Thu phí
/phieu-thu           → Quản lý Phiếu thu
/thong-ke            → Thống kê & Báo cáo
```

## 🔧 Cài đặt và Chạy

### Yêu cầu

- Node.js 18+
- npm hoặc yarn

### Cài đặt dependencies

```bash
cd frontend
npm install
```

### Cài đặt Heroicons (nếu chưa có)

```bash
npm install @heroicons/react
```

### Chạy development server

```bash
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

## 📦 Dependencies chính

- **Next.js 15** - Framework React
- **React 19** - Thư viện UI
- **Tailwind CSS** - CSS Framework
- **@heroicons/react** - Icon library
- **TypeScript** - Type safety

## 🔄 Tích hợp API (Chuẩn bị sau)

Hiện tại giao diện sử dụng **dữ liệu giả lập (mock data)**. Để tích hợp với backend:

1. Tạo thư mục `src/services/` cho API calls
2. Sử dụng `fetch` hoặc `axios` để gọi API
3. Thay thế mock data bằng dữ liệu thực từ backend
4. Thêm error handling và loading states
5. Implement authentication với JWT

### Ví dụ API Service (sẽ tạo sau)

```typescript
// src/services/hoKhauService.ts
export const getHoKhauList = async () => {
  const response = await fetch("http://localhost:3000/api/ho-khau");
  return response.json();
};
```

## 🎯 Các bước tiếp theo

### Tích hợp Backend

- [ ] Kết nối với NestJS backend
- [ ] Implement authentication với JWT
- [ ] API calls cho CRUD operations
- [ ] Error handling và validation
- [ ] Loading states và skeletons

### Tính năng nâng cao

- [ ] Thêm modal để tạo/chỉnh sửa dữ liệu
- [ ] Form validation với React Hook Form
- [ ] Biểu đồ với Chart.js hoặc Recharts
- [ ] Export Excel/PDF thực tế
- [ ] Upload ảnh/file đính kèm
- [ ] Notifications/Toast messages
- [ ] Dark mode

### Optimization

- [ ] Image optimization
- [ ] Code splitting
- [ ] SEO optimization
- [ ] Performance monitoring

## 🎨 Customization

### Thay đổi màu sắc

Chỉnh sửa file `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      // ...
    }
  }
}
```

### Thêm trang mới

1. Tạo folder trong `src/app/`
2. Tạo file `page.tsx`
3. Thêm route vào `Sidebar.tsx`

## 📝 Lưu ý

- **Chưa có API thực**: Tất cả dữ liệu đang là mock data
- **Authentication**: Chỉ là giao diện, chưa có logic xác thực thật
- **Validation**: Chỉ có HTML5 validation cơ bản
- **Biểu đồ**: Đang là placeholder, cần thêm thư viện chart
- **Icons**: Cần cài đặt `@heroicons/react` để hiển thị đúng

## 🤝 Đóng góp

1. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
2. Commit changes: `git commit -m 'Thêm tính năng mới'`
3. Push to branch: `git push origin feature/ten-tinh-nang`
4. Tạo Pull Request

## 📄 License

MIT License

---

**Phát triển bởi Team KTPM** 🚀
