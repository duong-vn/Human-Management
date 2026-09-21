# KẾ HOẠCH TỔNG THỂ NÂNG CẤP TOÀN DIỆN GIAO DIỆN (UI/UX REVAMP PLAN)
**Dự án**: Hệ thống Quản lý Tổ dân phố (TDP7 Phường La Khê)  
**Mục tiêu**: Nâng cấp toàn diện giao diện sang phong cách Enterprise SaaS hiện đại, sang trọng, nhất quán, tối ưu UX cho nghiệp vụ quản lý dân cư.  
**Nguyên tắc thực thi**: Tuyệt đối bảo lưu 100% logic nghiệp vụ, React Query hooks, API services, và luồng dữ liệu; chỉ tái cấu trúc và chuẩn hóa tầng hiển thị (Presentation Layer).

---

## 1. RÀ SOÁT HIỆN TRẠNG & CÁC VẤN ĐỀ CHÍ MẠNG (UI/UX AUDIT)

### 1.1. Xung đột Thương hiệu & Tên gọi (Brand Identity Crisis)
- **Tên dự án bị phân mảnh**: 
  - File `layout.tsx`: `TDP7 La Khê | Quản lý Tổ dân phố`.
  - File `Navbar.tsx`: Logo hiển thị chữ ghép lỗi: `KHÊ La Khê`.
  - File `Sidebar.tsx`: Chân trang ghi: `BlueMoon v1.0.0 © 2025 Quản lý chung cư`.
  - File `auth/login/page.tsx`: Logo `B` - `BlueMoon`.
- **Hệ quả**: Gây cảm giác chắp vá từ template chung cư, thiếu sự tin cậy của một hệ thống quản lý hành chính cơ sở.

### 1.2. Phân mảnh Ngôn ngữ Thiết kế (Design Inconsistency)
- **Bảng màu (Color Palette)**:
  - `globals.css` định nghĩa tone màu đất/stone thô (`#f5f5f4`, `#78716c`).
  - Trang Hộ khẩu (`ho-khau`): Dùng `gray-50/50`, nút đen nguyên bản `bg-black hover:bg-gray-800`, thẻ kính mờ `bg-white/70 backdrop-blur-xl`.
  - Trang Nhân khẩu (`nhan-khau`): Chuyển hoàn toàn sang tone `indigo-600` và `slate-50`.
  - Trang Thu phí (`thu-phi`): Dùng bảng màu đa sắc tự do (`rose-500`, `orange-500`, `blue-600`).
  - Trang Thống kê (`thong-ke`): Dùng gradient chói `from-blue-50 via-white to-indigo-50`, tiêu đề gắn emoji to, gạch chân gradient động.
- **Iconography**:
  - Đang cài đặt và dùng lẫn lộn cả `@heroicons/react` (trong Dashboard, Sidebar) lẫn `lucide-react` (trong Hộ khẩu, Nhân khẩu, Thu phí).
  - Dùng emoji tùy tiện (`🏠`, `👥`, `💰`, `📋`, `✨`, `🔒`, `📊`, `⟳`, `✕`) làm icon chính ở Dashboard và Thống kê.

### 1.3. Khuyết tật Cấu trúc Shell & Responsive
- **App Shell**: Cố định `ml-64 pt-16` thô cứng. Trên màn hình máy tính bảng (Tablet) hoặc điện thoại (Mobile), Sidebar đè lên nội dung, vỡ layout, không có cơ chế Drawer/Off-canvas mở gập.
- **Navbar**: Chưa có Avatar Menu / Dropdown profile, không có thanh thông báo, không có Breadcrumbs chỉ báo vị trí phân cấp. Nút đăng xuất đặt trơ trọi trên thanh điều hướng.

### 1.4. Trùng lặp Component & Anti-Patterns trong Code UI
- **Table**: Tự viết lại thẻ `<table>` ở mọi trang với padding, font chữ, độ bo góc, hover khác nhau. Chưa có thanh cuộn mượt hoặc thanh phân trang (Pagination) chuẩn hóa.
- **Modal / Dialog**: Mỗi trang một kiểu modal. `ho-khau` viết 7 file modal riêng lẻ; `nhan-khau` viết modal riêng; `thu-phi` viết modal state nhúng trực tiếp; thiếu một base `Modal/Dialog` tái sử dụng.
- **Search & Filters**: Kích thước ô input lệch nhau (`py-2`, `py-2.5`, `rounded-xl`, `rounded-lg`).
- **Code smell nghiêm trọng**: File `thong-ke/page.tsx` dùng `document.createElement('style')` inject CSS vào `document.head` trong `useEffect`; tự viết hệ thống thông báo toast bằng tay trong khi dự án đã cài đặt `sonner`.
- **Loading & Empty State**: Màn hình loading dùng spinner chiếm toàn màn hình (`h-screen bg-gray-50`) gây giật trang (layout shift). Thiếu Skeleton loading chuyên nghiệp.

---

## 2. ĐỊNH HÌNH DESIGN SYSTEM MỚI: "CIVIC MODERN SAAS"

Xây dựng hệ thống UI theo phong cách **Chính quyền điện tử hiện đại (Modern Civic Tech)**: Thanh lịch, trang nhã, tin cậy, sắc nét, tương phản đạt chuẩn WCAG AA.

### 2.1. Hệ thống Màu sắc Chuẩn (Design Tokens)
Định nghĩa hệ màu tập trung trong `globals.css` (Tailwind CSS v4 `@theme`):

| Nhóm Token | Màu sắc Hex | Mục đích ứng dụng |
|---|---|---|
| **Primary (Xanh Hành chính)** | `#1E40AF` (blue-800) -> `#2563EB` (blue-600) | Nút bấm chính, active navigation, liên kết, điểm nhấn thương hiệu |
| **Secondary / Slate** | `#475569` (slate-600) -> `#0F172A` (slate-900) | Màu chữ chính, heading, cấu trúc giao diện |
| **Surface / Background** | `#F8FAFC` (slate-50) | Nền tổng thể trang web (dịu mắt, không gắt như trắng tinh) |
| **Card / Elevated** | `#FFFFFF` (white) | Thẻ nội dung, bảng biểu, modal, popup |
| **Border / Divider** | `#E2E8F0` (slate-200) | Đường viền mảnh 1px phân tách tinh tế |
| **Success / Sinh / Thu đủ** | `#059669` (emerald-600), nền `#ECFDF5` | Trạng thái "Đang hoạt động", "Đã thu", "Thường trú" |
| **Warning / Nợ / Tạm vắng** | `#D97706` (amber-600), nền `#FFFBEB` | Trạng thái "Đang nợ", "Tạm vắng", "Chờ duyệt" |
| **Danger / Tử / Đã xóa** | `#DC2626` (red-600), nền `#FEF2F2` | "Đã qua đời", "Đã xóa", thao tác nguy hiểm |
| **Neutral Muted** | `#64748B` (slate-500) | Nhãn phụ, thời gian, số định danh phụ |

### 2.2. Typography & Hệ thống Phông chữ
- **Font chính**: `Nunito` (đã nạp qua `next/font/google` hỗ trợ tiếng Việt hoàn hảo).
- **Phân cấp Typo**:
  - Page Title: `text-2xl font-bold tracking-tight text-slate-900`
  - Section Header: `text-lg font-semibold text-slate-800`
  - Body Text: `text-sm text-slate-600 leading-relaxed`
  - Micro / Meta / Label: `text-xs font-medium text-slate-500`
  - Code / CCCD / Mã định danh: `font-mono text-xs font-semibold tracking-wider`

### 2.3. Chuẩn hóa Icon & Loại bỏ Thư viện Dư thừa
- **Thống nhất 1 thư viện duy nhất**: Toàn bộ icon chuyển về `lucide-react` (đã có trong `package.json`).
- **Gỡ bỏ**: `@heroicons/react` và các biểu tượng emoji hoạt hình không hợp với môi trường hành chính.
- **Visual Icon Rules**: Kích thước chuẩn `w-4 h-4` (nút/nhãn), `w-5 h-5` (menu), `w-6 h-6` (thẻ thống kê). Stroke width: `1.75` hoặc `2` đồng bộ.

---

## 3. THIẾT KẾ KIẾN TRÚC SHELL (APP SHELL & NAVIGATION)

### 3.1. Navbar (Thanh Điều Hướng Trên Cùng)
- **Thiết kế**: Nền trắng kính mờ (`bg-white/80 backdrop-blur-md`), viền dưới `border-b border-slate-200/80`, chiều cao chuẩn `h-16`.
- **Khu vực Trái**:
  - Nút Toggle Sidebar (cho Mobile và Tablet).
  - Logo chính quyền: Huy hiệu cờ đỏ/sao vàng hoặc khối icon cách điệu `Quốc huy/Tổ dân phố` + Tên ứng dụng đồng nhất:
    `BAN QUẢN LÝ DÂN CƯ` - `Tổ dân phố 7 Phường La Khê`.
- **Khu vực Phải**:
  - Badge trạng thái kết nối máy chủ (Server Online indicator).
  - Trình tìm kiếm nhanh toàn cục (Global Quick Search popup - phím tắt `Ctrl + K`).
  - Menu người dùng (User Dropdown Menu): Hiển thị Avatar tròn với initials, tên cán bộ, vai trò (`Quản trị viên` / `Cán bộ tổ dân phố`), menu xổ xuống có: Thông tin tài khoản, Đổi mật khẩu, và Đăng xuất an toàn.

### 3.2. Sidebar (Thanh Menu Dọc)
- **Thiết kế**: Nền trắng ngà hoặc Slate đậm sang trọng (`bg-slate-900 text-slate-300`), chiều rộng cố định `w-64`, hỗ trợ Responsive Collapse trên màn hình nhỏ.
- **Menu Items chuẩn hóa**:
  1. 📊 **Tổng quan (Dashboard)** - `/`
  2. 📑 **Quản lý Hộ khẩu** - `/ho-khau` (Submenu: Danh sách hộ khẩu, Thống kê biến động)
  3. 👥 **Quản lý Nhân khẩu** - `/nhan-khau` (Bộ lọc nhanh: Thường trú, Mới sinh, Đã qua đời)
  4. 💳 **Quản lý Thu phí** - `/thu-phi` (Submenu: Tổng quan đợt thu, Phí vệ sinh định kỳ, Quỹ đóng góp tự nguyện)
  5. 📝 **Tạm trú / Tạm vắng** - `/tam-tru-tam-vang`
  6. 📈 **Báo cáo & Thống kê** - `/thong-ke`
  7. 🛡️ **Quản trị người dùng** - `/user` (Dành cho Admin)
- **Cải tiến UX**:
  - Active Link Highlight: Pill bo góc với viền màu xanh primary, text sáng rõ, icon có chuyển động nhẹ.
  - Submenu accordion mượt mà, ghi nhớ trạng thái mở.
  - Footer Sidebar: Hiển thị phiên bản phần mềm `Hệ thống QLDC v2.0 - TDP 7 La Khê`, bỏ hoàn toàn thương hiệu lạ "BlueMoon".

---

## 4. XÂY DỰNG BỘ COMPONENT TÁI SỬ DỤNG (REUSABLE UI CORE)

Tạo thư mục `frontend/src/components/ui/` để quy tụ các UI component dùng chung, tránh viết lặp class Tailwind:

1. **`Button.tsx`**:
   - Variants: `primary` (blue), `secondary` (white viền slate-200), `danger` (red), `ghost` (trong suốt), `outline`.
   - Sizes: `sm` (h-8 px-3 text-xs), `md` (h-10 px-4 text-sm), `lg` (h-12 px-6 text-base).
   - Tích hợp sẵn spinner loading state (`isLoading`).
2. **`Card.tsx` / `StatCard.tsx`**:
   - Thẻ thống kê chuẩn hóa: Icon trong nền màu nhẹ tròn/vuông mềm, giá trị số lớn in đậm, nhãn phụ, phần trăm tăng trưởng hoặc so sánh với kỳ trước.
3. **`DataTable.tsx`**:
   - Khung bảng chuẩn: Sticky header, viền phân cách mỏng, hiệu ứng hover nhẹ từng dòng, hỗ trợ Sorting, Pagination chân bảng và Empty State đồ họa SVG khi danh sách trống.
4. **`Badge.tsx`**:
   - Hiển thị trạng thái tinh tế với chấm tròn nhỏ (status dot indicator) theo chuẩn:
     - `success`: Xanh ngọc (`bg-emerald-50 text-emerald-700 border-emerald-200`)
     - `warning`: Vàng hổ phách (`bg-amber-50 text-amber-700 border-amber-200`)
     - `danger`: Đỏ thắm (`bg-rose-50 text-rose-700 border-rose-200`)
     - `neutral`: Xám tro (`bg-slate-50 text-slate-700 border-slate-200`)
5. **`Modal.tsx` & `ConfirmDialog.tsx`**:
   - Thay thế các confirm modal rời rạc bằng một Modal Wrapper chung mượt mà với Framer Motion, backdrop blur `bg-slate-900/40`, focus trap và nút Esc để đóng.
6. **`Skeleton.tsx`**:
   - Hiệu ứng nhấp nháy (pulse) màu xám nhạt thay cho spinner tròn to tướng khi đang fetch dữ liệu, giữ nguyên layout trang không bị giật.
7. **`PageHeader.tsx`**:
   - Header đầu mỗi trang gồm: Breadcrumbs, Tiêu đề trang, Đoạn mô tả ngắn, và cụm Action Buttons bên phải (Thêm mới, Xuất file Excel/PDF).

---

## 5. KẾ HOẠCH CHI TIẾT TỪNG PHÂN HỆ NGHIỆP VỤ

### 5.1. Trang Xác thực (`/auth/login` & `/auth/register`)
- **Vấn đề**: Mang logo BlueMoon, form đơn điệu, bên phải trống trải.
- **Giải pháp Nâng cấp**:
  - Bố cục 2 cột (Split-screen):
    - Cột Trái (50%): Background gradient xanh hành chính cao cấp, hình ảnh minh họa công nghệ số/quản lý cộng đồng văn minh, trích dẫn cam kết an toàn dữ liệu tổ dân phố.
    - Cột Phải (50%): Form đăng nhập trau chuốt, logo chính thức của TDP7 La Khê, input có icon trực quan (User/Mail, Lock), nút hiển thị/ẩn mật khẩu (Show/Hide password), hỗ trợ phím Enter chuẩn form, xử lý lỗi tức thời.

### 5.2. Trang Bảng điều khiển Trung tâm (Dashboard - `/`)
- **Khi Chưa Đăng Nhập (Landing Page)**:
  - Nâng cấp Hero section chuẩn Portal Cổng thông tin điện tử TDP 7: Khối giới thiệu uy tín, các dịch vụ công dân trực tuyến, hướng dẫn liên hệ Tổ trưởng/Tổ phó dân phố.
- **Khi Đã Đăng Nhập (Management Dashboard)**:
  - **Hàng 1 - Chỉ số chính (KPI Grid 4 cột)**:
    - Tổng số Hộ khẩu (Kèm số hộ đang cư trú thực tế).
    - Tổng số Nhân khẩu (Chia tỷ lệ Nam / Nữ và Tuổi trung bình).
    - Thu phí kỳ hiện tại (Tỷ lệ hoàn thành % và Tổng số tiền đã thu).
    - Biến động nhân khẩu (Tạm trú mới / Tạm vắng trong tháng).
  - **Hàng 2 - Trực quan hóa dữ liệu (Charts & Quick Actions)**:
    - Biểu đồ phân bổ dân số theo độ tuổi (Tháp dân số / Bar chart).
    - Biểu đồ tiến độ thu các loại quỹ năm nay (Donut / Progress chart).
    - Khối Lối tắt nhanh (Quick Actions): "Đăng ký khai sinh", "Thêm hộ khẩu mới", "Lập phiếu thu tiền", "Đăng ký tạm trú".
  - **Hàng 3 - Nhật ký hoạt động gần đây (Recent Activities Feed)**:
    - Dòng thời gian các thay đổi mới nhất (vừa nhập hộ, vừa thu phí hộ ông/bà X) giúp cán bộ nắm bắt tức thì.

### 5.3. Phân hệ Quản lý Hộ khẩu (`/ho-khau` & `/ho-khau/thong-ke`)
- **Trang danh sách**:
  - Khối bộ lọc thông minh: Ô tìm kiếm đa năng (theo Tên chủ hộ, Số nhà, Mã hộ), Dropdown lọc theo Trạng thái hoạt động, Dropdown lọc theo Đường/Ngõ.
  - Bảng dữ liệu cao cấp:
    - Cột Mã hộ: Font mono nổi bật dạng thẻ chip.
    - Cột Chủ hộ: Avatar viết tắt chữ cái đầu, họ tên in đậm, CCCD và năm sinh nhỏ phía dưới.
    - Cột Địa chỉ: Icon MapPin, phân cấp Số nhà -> Đường -> Phường.
    - Cột Thành viên: Badge đếm số người, click để xem nhanh danh sách thành viên không cần tải lại trang.
  - Tối ưu Action Buttons: Thay cụm nút icon rời rạc bằng Action Menu (Dropdown 3 chấm `...`) hoặc nhóm nút bo góc rõ ràng: Xem chi tiết, Tách hộ, Đổi chủ hộ, Thêm thành viên, Xóa.
- **Trang thống kê Hộ khẩu (`/ho-khau/thong-ke`)**:
  - Thiết kế lại các thẻ đo lường quy mô hộ: Thống kê số hộ neo đơn (1 người), hộ chuẩn (2-4 người), hộ tam tứ đại đồng đường (5+ người).
  - Biểu đồ phân bố thành viên trực quan, loại bỏ các bảng tính toán thô.

### 5.4. Phân hệ Quản lý Nhân khẩu (`/nhan-khau`)
- **Thẻ thống kê nhanh đầu trang**: Tổng nhân khẩu, Nhân khẩu nam, Nhân khẩu nữ, Trẻ mới sinh trong năm, Người cao tuổi.
- **Bộ lọc đa tầng (Filter Toolbar)**:
  - Tìm theo Họ tên, CCCD/Định danh 12 số, Năm sinh, Giới tính, Tình trạng (Thường trú, Đã mất).
- **Trình bày Bảng Nhân khẩu**:
  - Dòng nhân khẩu "Đã qua đời": Thiết kế trạng thái inactive tinh tế (chữ xám mờ, badge xám trang trọng, không dùng icon đầu lâu gây phản cảm; thay bằng icon `Archive` hoặc nhãn `Đã mất` tôn trọng).
  - Trẻ mới sinh: Huy hiệu `Mới sinh` nhỏ gọn, màu tím pastel / xanh dịu dàng.
- **Modal Chi tiết Nhân khẩu**:
  - Thiết kế dạng Profile Card / Hồ sơ cư dân 2 cột đẹp mắt: Ảnh đại diện/Placeholder, Thông tin nhân thân, Quê quán, Nghề nghiệp, Số định danh, Lịch sử cư trú.

### 5.5. Phân hệ Quản lý Thu phí & Khoản thu (`/thu-phi`)
- **Trang Tổng quan (`/thu-phi`)**:
  - Khối thẻ tài chính:
    - Thẻ Xanh: Tổng thực thu Phí vệ sinh / cố định.
    - Thẻ Tím: Tổng quỹ đóng góp tự nguyện (Vì người nghèo, Đền ơn đáp nghĩa...).
    - Thẻ Hổ phách: Tổng tiền còn nợ/chưa thu.
  - Bảng danh sách phiếu thu: Hiển thị rõ Mã phiếu, Tên chủ hộ, Kỳ thu, Số tiền (định dạng tiền tệ VNĐ chuẩn có màu sắc phân biệt Đã thu / Chưa thu).
  - Modal tạo phiếu thu & thu tiền: Form nhập liệu thông minh tự tính tiền dựa trên số nhân khẩu của hộ được chọn.
- **Trang Phí cố định (`/thu-phi/ve-sinh`) & Đóng góp (`/thu-phi/dong-gop`)**:
  - Bảng tính toán phí tự động: Bố trí lại form chọn tháng/năm, hiển thị công thức tính minh bạch `(Đơn giá x Số người x 12 tháng)`.
  - Tích hợp tính năng In phiếu thu trực tiếp (Print Preview chuyên nghiệp có tiêu ngữ, chữ ký người nộp và thủ quỹ).

### 5.6. Phân hệ Tạm trú / Tạm vắng (`/tam-tru-tam-vang`)
- **Giao diện phân loại Tab trực quan**:
  - Tab 1: **Tạm trú** (Người từ nơi khác đến sinh sống).
  - Tab 2: **Tạm vắng** (Cư dân trong tổ đi làm ăn, học tập nơi khác).
  - Tab 3: **Sắp hết hạn** (Cảnh báo các hồ sơ còn dưới 15 ngày để cán bộ nhắc nhở gia hạn).
- **Bảng danh sách**:
  - Highlight rõ thời hạn: Ngày bắt đầu -> Ngày kết thúc.
  - Tự động đánh dấu hồ sơ quá hạn bằng màu sắc cảnh báo dễ nhận biết.

### 5.7. Phân hệ Báo cáo & Thống kê (`/thong-ke`)
- **Loại bỏ triệt để**:
  - Mã nguồn tự chèn `<style>` qua JavaScript.
  - Các emoji hoạt hình lòe loẹt.
  - Hệ thống toast tự chế, chuyển hoàn toàn sang `sonner`.
- **Nâng cấp giao diện**:
  - Khối chọn Năm và Đợt thu gọn gàng với Select Picker chuẩn.
  - Bảng đối soát thu nộp 2 cột đối xứng:
    - Cột 1: Danh sách các hộ đã hoàn thành nghĩa vụ.
    - Cột 2: Danh sách các hộ còn nợ đọng (kèm nút nhắc nhở hoặc in thông báo nợ).
  - Nút xuất dữ liệu ra file Excel / CSV chuẩn form biểu mẫu nhà nước.

### 5.8. Phân hệ Quản trị Người dùng (`/user`)
- Bảng danh sách tài khoản cán bộ: Hiển thị Tên tài khoản, Email, Số điện thoại, Phân quyền (`Admin` / `User`), Trạng thái (`Kích hoạt` / `Khóa`).
- Modal cấp mới tài khoản và phân quyền rõ ràng, mật khẩu được che chắn bảo mật.

---

## 6. LỘ TRÌNH TRIỂN KHAI THEO TỪNG GIAI ĐOẠN (PHASING STRATEGY)

Để đảm bảo an toàn tuyệt đối, không gây downtime hay lỗi API, quá trình nâng cấp sẽ đi theo 4 giai đoạn độc lập:

```
[Giai đoạn 1: Nền tảng & Shell]
    ├── Cấu hình Design Tokens trong globals.css
    ├── Chuẩn hóa Icon (Lucide) & Gỡ bỏ Brand "BlueMoon"
    ├── Tái thiết kế Navbar & Responsive Sidebar
    └── Xây dựng bộ UI Primitives (Button, Card, Badge, Modal, Skeleton)
             ↓
[Giai đoạn 2: Dashboard & Auth]
    ├── Thiết kế lại Login / Register (Split screen)
    └── Hiện đại hóa Dashboard (KPI Cards, Lối tắt nhanh, Activity Feed)
             ↓
[Giai đoạn 3: Phân hệ Cốt lõi Dân cư]
    ├── Refactor Giao diện Hộ khẩu + Các modal thao tác
    ├── Refactor Giao diện Nhân khẩu + Profile view
    └── Refactor Giao diện Tạm trú / Tạm vắng
             ↓
[Giai đoạn 4: Tài chính, Báo cáo & Hoàn thiện]
    ├── Refactor Giao diện Thu phí (Cố định + Đóng góp)
    ├── Dọn dẹp & Chuẩn hóa Trang Thống kê Báo cáo
    └── Kiểm thử Responsive toàn diện (Desktop, Tablet, Mobile)
```

---

## 7. QUY TẮC BẢO MẬT & BẢO LƯU DỮ LIỆU KHI THI CÔNG
1. **Zero Logic Breaking**: Giữ nguyên toàn bộ các hàm gọi API trong `api.ts`, các interface trong `types.ts`, và state `useQuery`/`useMutation` của TanStack React Query. Chỉ thay đổi phần JSX render và class Tailwind CSS.
2. **Strict Type Safety**: Đảm bảo toàn bộ component mới viết bằng TypeScript strict, không ép kiểu `any`.
3. **No Redundant Dep**: Tận dụng tối đa các thư viện đã cài (`lucide-react`, `framer-motion`, `sonner`, `tailwindcss v4`). Không cài thêm các thư viện cồng kềnh ngoài luồng.
4. **Accessibility (a11y)**: Mọi nút bấm icon đều có `aria-label`, bảng dữ liệu có `caption`/`thead` chuẩn ngữ nghĩa, độ tương phản text/background đạt chuẩn.

---

## 8. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
- [ ] Giao diện thống nhất 100% thương hiệu: "Tổ dân phố 7 Phường La Khê" (không còn dấu vết BlueMoon).
- [ ] Bảng màu chuẩn Civic SaaS (Slate / Blue Primary / Emerald / Amber) phủ khắp tất cả các trang.
- [ ] 100% icon chuyển sang Lucide React; không còn emoji hoạt hình trên giao diện quản trị.
- [ ] Không còn code chèn style tùy tiện (`document.createElement('style')`); toàn bộ thông báo dùng `sonner`.
- [ ] Bảng dữ liệu trên Desktop và Mobile hiển thị sắc nét, không vỡ layout, thao tác mượt mà dưới 60fps.
- [ ] Bản build `npm run build` của Frontend hoàn tất thành công, không có lỗi TypeScript hay ESLint.
