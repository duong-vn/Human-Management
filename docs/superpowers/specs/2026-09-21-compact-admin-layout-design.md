# Thiết kế: Tối ưu Layout Quản trị, Tinh gọn Thẻ Thông số & Đồng nhất Giao diện

**Ngày:** 2026-09-21  
**Trạng thái:** Đã thống nhất  

## 1. Mục tiêu
- **Tối ưu không gian hiển thị (above the fold):** Đẩy dữ liệu bảng và công cụ thao tác chính lên ngay tầm mắt người dùng, giảm thiểu tối đa việc cuộn trang.
- **Loại bỏ Header thừa trên Desktop:** Sau khi cán bộ đăng nhập, ẩn top navbar trên màn hình desktop (`md:hidden`). Đưa thông tin tài khoản (profile) và nút đăng xuất xuống chân Sidebar.
- **Thẻ thông số siêu gọn (Ultra-compact Stat Cards):** Thay thế cụm card to, chiếm diện tích và bo góc cứng hiện tại bằng hàng thẻ nhỏ gọn (`rounded-xl`, chiều cao ~56-60px, padding `p-2.5` - `p-3`), viền mảnh dịu mắt. Hỗ trợ nút thu gọn/mở rộng (collapsible) để cán bộ có thể ẩn hoàn toàn khi cần tập trung vào bảng dữ liệu.
- **Đồng nhất giao diện toàn hệ thống:** Tất cả các trang danh sách và nghiệp vụ (Nhân khẩu, Hộ khẩu, Tạm trú/Tạm vắng, Thống kê, Thu phí, Dashboard) có cùng ngôn ngữ thị giác: PageHeader tinh gọn, cấu trúc bộ lọc và bảng dữ liệu đồng bộ.

---

## 2. Kiến trúc & Chi tiết Thay đổi

### 2.1. Tái cấu trúc Layout & Điều hướng (`MainLayout`, `Navbar`, `Sidebar`)
- **`Navbar.tsx`:**
  - Nếu người dùng đã đăng nhập: Ẩn hoàn toàn trên màn hình desktop (`hidden` trên `md+`), chỉ hiển thị thanh bar mỏng (chiều cao 48-52px) trên thiết bị di động (`md:hidden`) với nút hamburger mở drawer và tên đơn vị "Tổ dân phố 7".
  - Nếu chưa đăng nhập (khách vãng lai): Giữ nguyên navbar có nút "Đăng nhập cán bộ".
- **`Sidebar.tsx`:**
  - Phần chân sidebar (Sidebar Footer): Bỏ khung trang trí tĩnh "Quản lý dân cư...", thay bằng khối Profile cán bộ:
    - Avatar tròn với chữ cái đầu của username.
    - Username và nhãn vai trò ("Quản trị viên" / "Cán bộ quản lý").
    - Nút quản trị tài khoản (icon `ShieldCheck` hoặc `UserIcon`, chỉ hiển thị với admin).
    - Nút đăng xuất nhanh (icon `LogOut`) kèm xử lý xác nhận/toast.
- **`MainLayout.tsx` & `globals.css`:**
  - Khi đã đăng nhập và trên desktop: Bỏ `pt-[var(--header-height)]`, đưa khoảng đệm đỉnh trang về mức gọn gàng (`pt-4 sm:pt-6`), giảm bớt khoảng trống dư thừa.

### 2.2. Thiết kế StatCard Siêu Gọn (`StatCard.tsx`)
- Thêm hoặc chuẩn hóa variant `compact` / `strip`:
  - Kích thước: Chiều cao chỉ ~52-60px, padding `px-3 py-2.5`, bo góc `rounded-xl` mềm mại.
  - Cấu trúc: 1 hàng linh hoạt gồm:
    - Tiêu đề nhỏ xám bên trên (`text-[11px] font-medium text-slate-500 uppercase tracking-wider`).
    - Số liệu rõ ràng, số tabular không bị tràn vỡ (`text-lg sm:text-xl font-bold text-slate-900 tabular-nums`).
    - Icon phụ trợ nhỏ (`w-4 h-4 text-slate-400`), đặt cạnh tiêu đề hoặc số liệu.
  - Màu sắc: Tông slate/neutral dịu nhẹ, viền mảnh `border-slate-200`, không dùng nền màu chói hoặc glow.

### 2.3. Cụm Thống kê Thu gọn được (`StatSection` / Collapsible Stats Bar)
- Cung cấp tính năng bật/tắt (toggle) danh sách thẻ thống kê trên các trang có card tổng quan:
  - Nút bấm tinh gọn đặt cạnh tiêu đề hoặc nhóm nút hành động của `PageHeader`: Ví dụ nút `Thu gọn số liệu` / `Hiện số liệu` (icon `ChevronUp` / `ChevronDown`).
  - Khi mở: Hiển thị 1 hàng ngang 4 thẻ compact (`grid grid-cols-2 lg:grid-cols-4 gap-2.5`).
  - Khi thu gọn: Ẩn toàn bộ cụm card, nhường 100% không gian màn hình cho thanh tìm kiếm và bảng dữ liệu.
  - Lưu trạng thái mở/đóng vào `localStorage` theo từng trang để giữ nguyên trải nghiệm qua các lần truy cập.

### 2.4. Đồng nhất trên các trang nghiệp vụ
- **Trang Quản lý Nhân khẩu (`/nhan-khau`):**
  - Đổi cụm 1 card to + 3 card dọc thành 1 hàng 4 card compact (Tổng nhân khẩu, Nam giới, Nữ giới, Tuổi trung bình) có nút thu gọn.
  - Bảng danh sách nhân khẩu hiển thị ngay lập tức trong màn hình làm việc.
- **Trang Báo cáo & Thống kê (`/thong-ke`):**
  - Đổi cụm card năm thành 1 hàng 4 card compact (Tổng thu trong năm, Số đợt thu, Lượt hộ đã nộp, Lượt hộ chưa nộp) có nút thu gọn.
- **Trang Quản lý Hộ khẩu (`/ho-khau`) & Tạm trú / Tạm vắng (`/tam-tru-tam-vang`):**
  - Chuẩn hóa khoảng cách của `PageHeader`, thanh tìm kiếm và bảng danh sách đồng bộ theo tỉ lệ mới.
- **Trang Tổng quan Dashboard (`/`):**
  - Áp dụng layout không header desktop, tối ưu chiều cao các thẻ KPI.

---

## 3. Kế hoạch Kiểm thử & Xác nhận
1. **Kiểm tra hiển thị component:** Chạy test xác thực render HTML bằng `node scripts/verify-admin-ui.mjs` để bảo đảm cấu trúc semantic (`dt`, `dd`, `table`, `aria-expanded`).
2. **Kiểm tra Responsive & Layout:**
   - Desktop (`>= 768px`): Không còn top navbar, chân sidebar có đủ profile + đăng xuất, bảng dữ liệu đẩy lên sát đầu trang.
   - Mobile (`< 768px`): Top bar di động hoạt động tốt, mở drawer sidebar bình thường.
3. **Kiểm tra tính năng Thu gọn:** Bấm nút ẩn/hiện số liệu mượt mà, lưu trạng thái sau khi refresh trang.
4. **Kiểm tra TypeScript & Build:** Chạy `npm run build` hoặc typecheck trong thư mục `frontend` không phát sinh lỗi.
