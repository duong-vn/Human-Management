# API Documentation - Hệ thống Quản lý Tổ dân phố

## Giới thiệu

Backend API cho hệ thống quản lý thông tin tổ dân phố 7 - Phường La Khê. Hệ thống hỗ trợ quản lý nhân khẩu, hộ khẩu, tạm trú/tạm vắng và thu phí.

**Base URL:** `http://localhost:8080/api`

**Swagger Documentation:** `http://localhost:8080/docs`

## Xác thực (Authentication)

Hệ thống sử dụng JWT (JSON Web Token) để xác thực. Sau khi đăng nhập thành công, bạn sẽ nhận được `access_token`. Token này cần được gửi trong header `Authorization` với format:

```
Authorization: Bearer <access_token>
```

### Roles (Phân quyền)

| Role        | Mô tả     | Quyền hạn                                   |
| ----------- | --------- | ------------------------------------------- |
| `to_truong` | Tổ trưởng | Toàn quyền - thực hiện tất cả các nghiệp vụ |
| `to_pho`    | Tổ phó    | Toàn quyền - thực hiện tất cả các nghiệp vụ |
| `ke_toan`   | Kế toán   | Quản lý thu phí, khoản thu                  |
| `can_bo`    | Cán bộ    | Quản lý nhân khẩu, hộ khẩu cơ bản           |

---

## 1. Auth APIs (Xác thực)

### 1.1. Đăng nhập

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a...",
    "username": "admin",
    "hoTen": "Nguyễn Văn A",
    "email": "admin@example.com",
    "role": "to_truong"
  }
}
```

### 1.2. Đăng ký

```http
POST /api/auth/register
Content-Type: application/json

{
  "hoTen": "Nguyễn Văn B",
  "username": "nhanvien1",
  "email": "nhanvien1@example.com",
  "password": "password123",
  "soDienThoai": "0901234567"
}
```

### 1.3. Lấy thông tin Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

## 2. Nhân khẩu APIs

### 2.1. Lấy danh sách nhân khẩu

```http
GET /api/nhan-khau
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `hoKhauId` | string | Lọc theo hộ khẩu |
| `trangThai` | string | Lọc theo trạng thái: `Thường trú`, `Tạm trú`, `Tạm vắng`, `Đã chuyển đi`, `Đã qua đời` |
| `gioiTinh` | string | Lọc theo giới tính: `Nam`, `Nữ` |

### 2.2. Thêm nhân khẩu mới

```http
POST /api/nhan-khau
Authorization: Bearer <token>
Content-Type: application/json

{
  "hoTen": "Nguyễn Văn C",
  "biDanh": "",
  "ngaySinh": "1990-01-15",
  "noiSinh": "Hà Nội",
  "queQuan": "Hà Nội",
  "danToc": "Kinh",
  "ngheNghiep": "Kỹ sư",
  "noiLamViec": "Công ty ABC",
  "soDinhDanh": {
    "loai": "CCCD",
    "so": "001234567890",
    "ngayCap": "2020-01-01",
    "noiCap": "Cục CS QLHC về TTXH"
  },
  "gioiTinh": "Nam",
  "tonGiao": "Không",
  "quocTich": "Việt Nam",
  "diaChiHienTai": {
    "soNha": "123",
    "duong": "Đường ABC",
    "phuongXa": "La Khê",
    "quanHuyen": "Hà Đông",
    "tinhThanh": "Hà Nội"
  },
  "diaChiThuongTru": {
    "soNha": "123",
    "duong": "Đường ABC",
    "phuongXa": "La Khê",
    "quanHuyen": "Hà Đông",
    "tinhThanh": "Hà Nội"
  },
  "hoKhauId": "64a...",
  "quanHeVoiChuHo": "Con"
}
```

### 2.3. Thêm nhân khẩu mới sinh

```http
POST /api/nhan-khau/moi-sinh
Authorization: Bearer <token>
Content-Type: application/json

{
  "hoTen": "Nguyễn Văn D",
  "ngaySinh": "2024-01-01",
  "gioiTinh": "Nam",
  "hoKhauId": "64a...",
  "quanHeVoiChuHo": "Con"
}
```

### 2.4. Đánh dấu nhân khẩu chuyển đi

```http
PATCH /api/nhan-khau/:id/chuyen-di
Authorization: Bearer <token>
Content-Type: application/json

{
  "ngayChuyenDi": "2024-01-15",
  "noiChuyenDen": "TP. Hồ Chí Minh",
  "lyDoChuyenDi": "Chuyển công tác"
}
```

### 2.5. Đánh dấu nhân khẩu qua đời

```http
PATCH /api/nhan-khau/:id/qua-doi
Authorization: Bearer <token>
Content-Type: application/json

{
  "ngayMat": "2024-01-20"
}
```

### 2.6. Tìm kiếm nhân khẩu

```http
GET /api/nhan-khau/search?keyword=Nguyễn
Authorization: Bearer <token>
```

### 2.7. Lấy lịch sử thay đổi nhân khẩu

```http
GET /api/nhan-khau/:id/lich-su
Authorization: Bearer <token>
```

### 2.8. Thống kê theo giới tính

```http
GET /api/nhan-khau/thong-ke/gioi-tinh
Authorization: Bearer <token>
```

**Response:**

```json
[
  { "_id": "Nam", "soLuong": 850 },
  { "_id": "Nữ", "soLuong": 850 }
]
```

### 2.9. Thống kê theo độ tuổi

```http
GET /api/nhan-khau/thong-ke/do-tuoi
Authorization: Bearer <token>
```

**Response:**

```json
[
  { "_id": "Mầm non (0-2)", "soLuong": 50 },
  { "_id": "Mẫu giáo (3-5)", "soLuong": 80 },
  { "_id": "Cấp 1 (6-10)", "soLuong": 120 },
  { "_id": "Cấp 2 (11-14)", "soLuong": 100 },
  { "_id": "Cấp 3 (15-17)", "soLuong": 90 },
  { "_id": "Độ tuổi lao động (18-59)", "soLuong": 1100 },
  { "_id": "Nghỉ hưu (60+)", "soLuong": 160 }
]
```

### 2.10. Thống kê tổng quan

```http
GET /api/nhan-khau/thong-ke/tong-quan
Authorization: Bearer <token>
```

**Response:**

```json
{
  "tong": 1700,
  "thuongTru": 1500,
  "tamTru": 150,
  "tamVang": 30,
  "daChuyenDi": 15,
  "daQuaDoi": 5
}
```

---

## 3. Hộ khẩu APIs

### 3.1. Lấy danh sách hộ khẩu

```http
GET /api/ho-khau
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `trangThai` | string | `Đang hoạt động`, `Đã tách hộ`, `Đã xóa` |
| `search` | string | Tìm theo mã hộ khẩu hoặc tên chủ hộ |

### 3.2. Tạo hộ khẩu mới

```http
POST /api/ho-khau
Authorization: Bearer <token>
Content-Type: application/json

{
  "maHoKhau": "HK-00001",
  "chuHo": {
    "nhanKhauId": "64a...",
    "hoTen": "Nguyễn Văn A"
  },
  "diaChi": {
    "soNha": "123",
    "duong": "Đường ABC",
    "phuongXa": "La Khê",
    "quanHuyen": "Hà Đông",
    "tinhThanh": "Hà Nội"
  },
  "thanhVien": [
    {
      "nhanKhauId": "64a...",
      "hoTen": "Nguyễn Thị B",
      "quanHeVoiChuHo": "Vợ"
    }
  ]
}
```

### 3.3. Tách hộ

```http
POST /api/ho-khau/tach-ho
Authorization: Bearer <token>
Content-Type: application/json

{
  "hoKhauGocId": "64a...",
  "maHoKhauMoi": "HK-00402",
  "chuHoMoi": {
    "nhanKhauId": "64a...",
    "hoTen": "Nguyễn Văn E"
  },
  "diaChi": {
    "soNha": "456",
    "duong": "Đường XYZ",
    "phuongXa": "La Khê",
    "quanHuyen": "Hà Đông",
    "tinhThanh": "Hà Nội"
  },
  "danhSachNhanKhauId": ["64a...", "64a..."]
}
```

### 3.4. Thay đổi chủ hộ

```http
PATCH /api/ho-khau/:id/thay-doi-chu-ho
Authorization: Bearer <token>
Content-Type: application/json

{
  "chuHoMoiId": "64a...",
  "hoTenChuHoMoi": "Nguyễn Văn F",
  "lyDo": "Chủ hộ cũ qua đời"
}
```

### 3.5. Thêm thành viên vào hộ khẩu

```http
PATCH /api/ho-khau/:id/them-thanh-vien
Authorization: Bearer <token>
Content-Type: application/json

{
  "nhanKhauId": "64a...",
  "hoTen": "Nguyễn Văn G",
  "quanHeVoiChuHo": "Con"
}
```

### 3.6. Xóa thành viên khỏi hộ khẩu

```http
PATCH /api/ho-khau/:id/xoa-thanh-vien/:nhanKhauId
Authorization: Bearer <token>
```

### 3.7. Lấy lịch sử thay đổi hộ khẩu

```http
GET /api/ho-khau/:id/lich-su
Authorization: Bearer <token>
```

### 3.8. Thống kê hộ khẩu

```http
GET /api/ho-khau/thong-ke
Authorization: Bearer <token>
```

**Response:**

```json
{
  "tong": 420,
  "dangHoatDong": 400,
  "daTachHo": 15,
  "daXoa": 5
}
```

### 3.9. Tạo mã hộ khẩu tự động

```http
GET /api/ho-khau/generate-ma
Authorization: Bearer <token>
```

---

## 4. Tạm trú/Tạm vắng APIs

### 4.1. Lấy danh sách tạm trú/tạm vắng

```http
GET /api/tam-tru-tam-vang
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `loai` | string | `Tạm trú` hoặc `Tạm vắng` |
| `trangThai` | string | `Đang hiệu lực`, `Hết hạn`, `Đã hủy` |
| `tuNgay` | date | Từ ngày |
| `denNgay` | date | Đến ngày |

### 4.2. Đăng ký tạm trú

```http
POST /api/tam-tru-tam-vang
Authorization: Bearer <token>
Content-Type: application/json

{
  "nhanKhauId": "64a...",
  "hoTen": "Trần Văn H",
  "loai": "Tạm trú",
  "tuNgay": "2024-01-01",
  "denNgay": "2024-06-30",
  "diaChiTamTru": "123 Đường ABC, La Khê, Hà Đông",
  "diaChiThuongTru": "456 Đường XYZ, Nam Từ Liêm, Hà Nội",
  "lyDo": "Thuê nhà làm việc"
}
```

### 4.3. Đăng ký tạm vắng

```http
POST /api/tam-tru-tam-vang
Authorization: Bearer <token>
Content-Type: application/json

{
  "nhanKhauId": "64a...",
  "hoTen": "Nguyễn Văn I",
  "loai": "Tạm vắng",
  "tuNgay": "2024-01-01",
  "denNgay": "2024-03-31",
  "noiDen": "TP. Hồ Chí Minh",
  "lyDo": "Đi công tác dài ngày"
}
```

### 4.4. Thống kê tạm trú/tạm vắng

```http
GET /api/tam-tru-tam-vang/thong-ke
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `tuNgay` | date | Từ ngày |
| `denNgay` | date | Đến ngày |

**Response:**

```json
{
  "tamTru": 150,
  "tamVang": 30,
  "tongCong": 180
}
```

---

## 5. Khoản thu APIs

### 5.1. Lấy danh sách khoản thu

```http
GET /api/khoan-thu
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `loaiKhoanThu` | string | `Bắt buộc` hoặc `Tự nguyện` |
| `isActive` | boolean | Trạng thái hoạt động |

### 5.2. Tạo khoản thu mới

**Khoản thu bắt buộc (Phí vệ sinh):**

```http
POST /api/khoan-thu
Authorization: Bearer <token>
Content-Type: application/json

{
  "tenKhoanThu": "Phí vệ sinh năm 2024",
  "loaiKhoanThu": "Bắt buộc",
  "moTa": "Phí vệ sinh hàng năm",
  "soTien": 6000,
  "donViTinh": "VNĐ/tháng/nhân khẩu",
  "ngayBatDau": "2024-01-01",
  "ngayKetThuc": "2024-12-31",
  "isActive": true
}
```

**Khoản đóng góp tự nguyện:**

```http
POST /api/khoan-thu
Authorization: Bearer <token>
Content-Type: application/json

{
  "tenKhoanThu": "Ủng hộ ngày thương binh-liệt sỹ 27/07",
  "loaiKhoanThu": "Tự nguyện",
  "moTa": "Đợt vận động ủng hộ ngày 27/07/2024",
  "ngayBatDau": "2024-07-01",
  "ngayKetThuc": "2024-07-31",
  "tenDotThu": "Ủng hộ ngày thương binh-liệt sỹ 27/07/2024",
  "isActive": true
}
```

### 5.3. Lấy danh sách khoản thu bắt buộc

```http
GET /api/khoan-thu/bat-buoc
Authorization: Bearer <token>
```

### 5.4. Lấy danh sách khoản đóng góp tự nguyện

```http
GET /api/khoan-thu/tu-nguyen
Authorization: Bearer <token>
```

---

## 6. Thu phí APIs

### 6.1. Lấy danh sách phiếu thu

```http
GET /api/thu-phi
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `hoKhauId` | string | Lọc theo hộ khẩu |
| `nam` | number | Lọc theo năm |
| `trangThai` | string | `Đã thu`, `Chưa thu`, `Đang nợ` |
| `khoanThuId` | string | Lọc theo khoản thu |
| `kyThu` | string | Lọc theo kỳ thu |

### 6.2. Tạo phiếu thu mới

```http
POST /api/thu-phi
Authorization: Bearer <token>
Content-Type: application/json

{
  "maPhieuThu": "PT-2024-0001",
  "hoKhauId": "64a...",
  "tenChuHo": "Nguyễn Văn A",
  "diaChi": "123 Đường ABC, La Khê, Hà Đông",
  "soNhanKhau": 4,
  "chiTietThu": [
    {
      "khoanThuId": "64a...",
      "tenKhoanThu": "Phí vệ sinh năm 2024",
      "soTien": 288000,
      "ghiChu": "4 nhân khẩu x 6000 VNĐ x 12 tháng"
    },
    {
      "khoanThuId": "64a...",
      "tenKhoanThu": "Ủng hộ ngày thương binh-liệt sỹ 27/07",
      "soTien": 100000,
      "ghiChu": "Đóng góp tự nguyện"
    }
  ],
  "tongTien": 388000,
  "ngayThu": "2024-07-15",
  "trangThai": "Đã thu",
  "nam": 2024,
  "kyThu": "Năm 2024"
}
```

### 6.3. Tạo mã phiếu thu tự động

```http
GET /api/thu-phi/generate-ma/:nam
Authorization: Bearer <token>
```

### 6.4. Thống kê thu phí theo năm

```http
GET /api/thu-phi/thong-ke/nam/:nam
Authorization: Bearer <token>
```

**Response:**

```json
{
  "tongTien": 150000000,
  "soPhieuThu": 380,
  "soHoDaNop": 350
}
```

### 6.5. Thống kê chi tiết theo từng khoản thu

```http
GET /api/thu-phi/thong-ke/chi-tiet/:nam
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "khoanThuId": "64a...",
    "tenKhoanThu": "Phí vệ sinh năm 2024",
    "tongTien": 100000000,
    "soHoDaNop": 350
  },
  {
    "khoanThuId": "64a...",
    "tenKhoanThu": "Ủng hộ ngày thương binh-liệt sỹ 27/07",
    "tongTien": 50000000,
    "soHoDaNop": 280
  }
]
```

### 6.6. Thống kê theo khoản thu cụ thể

```http
GET /api/thu-phi/thong-ke/khoan-thu/:khoanThuId?nam=2024
Authorization: Bearer <token>
```

### 6.7. Lấy danh sách phiếu thu theo hộ khẩu

```http
GET /api/thu-phi/ho-khau/:hoKhauId
Authorization: Bearer <token>
```

---

## 7. Users APIs (Quản lý người dùng)

### 7.1. Lấy danh sách người dùng

```http
GET /api/users
Authorization: Bearer <token>
```

### 7.2. Cập nhật thông tin người dùng

```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "hoTen": "Nguyễn Văn Updated",
  "email": "updated@example.com",
  "role": "ke_toan"
}
```

---

## Error Responses

Tất cả các API đều trả về error response theo format sau:

```json
{
  "statusCode": 400,
  "message": "Thông báo lỗi",
  "error": "Bad Request"
}
```

**Common Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy |
| 500 | Internal Server Error |

---

## Environment Variables

Tạo file `.env.development` hoặc `.env.production`:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/quan-ly-to-dan-pho
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Chạy ứng dụng

```bash
# Cài đặt dependencies
npm install

# Chạy development
npm run dev

# Chạy production
npm run build
npm run start:prod
```

---

## Swagger UI

Truy cập Swagger UI để test API trực tiếp tại: `http://localhost:8080/docs`
