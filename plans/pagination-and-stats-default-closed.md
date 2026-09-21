# Kế hoạch: Sửa dữ liệu thống kê nhân khẩu, phân trang đồng bộ toàn app & mặc định đóng các thẻ thống kê

**Ngày:** 2026-09-21
**Dự án:** `D:/Human-Management`

---

## 1. Context & Mục tiêu
1. **Dữ liệu thống kê nhân khẩu (`/nhan-khau`) không hiển thị (bị kẹt ở 0):**
   - Phía frontend: `useQuery` dùng `initialData` kết hợp `staleTime: 60s` khiến TanStack Query coi dữ liệu đã mới và không bao giờ gửi request `getThongKeNhanKhau` khi mở trang.
   - Phía backend: Route `@Get('thong-ke/chung')` đặt sau `@Get(':id')` trong `nhan-khau.controller.ts`.
2. **Triển khai phân trang đồng bộ toàn bộ danh sách trong app:**
   - Hiện tại tất cả danh sách (`/ho-khau`, `/nhan-khau`, `/tam-tru-tam-vang`, `/user`, `/thu-phi`, `/thu-phi/ve-sinh`) tải toàn bộ dữ liệu từ API (client-side data) nhưng không có phân trang hoặc hiển thị vô tận.
   - Cần chuẩn hóa phân trang đồng bộ (chuẩn 10 mục/trang cho bảng dữ liệu), tự động reset về trang 1 khi lọc/tìm kiếm, giao diện thanh điều hướng đồng nhất.
3. **Mặc định đóng các thẻ thống kê:**
   - 7 trang có thẻ thống kê (`/`, `/nhan-khau`, `/thong-ke`, `/ho-khau/thong-ke`, `/thu-phi`, `/thu-phi/ve-sinh`, `/thu-phi/dong-gop`) đều dùng hook `useStatsVisibility(storageKey)`.
   - Hiện tại mặc định là `useState(true)` (mở). Cần chuyển sang mặc định `false` (đóng/thu gọn).

---

## 2. Giải pháp kỹ thuật

### A. Sửa dữ liệu thống kê nhân khẩu
- **`frontend/src/app/nhan-khau/page.tsx`**:
  - Đổi `initialData` thành `placeholderData: { total: 0, male: 0, female: 0, avgAge: 0 }` (hoặc đặt `initialDataUpdatedAt: 0`).
  - Đảm bảo khi mount, React Query gọi ngay `getThongKeNhanKhau()` để cập nhật số liệu thực tế.
- **`backend/src/nhan-khau/nhan-khau.controller.ts`**:
  - Di chuyển route `@Get('thong-ke/chung')` lên phía trên `@Get(':id')` để tránh xung đột routing NestJS.
- **`backend/src/nhan-khau/nhan-khau.service.ts`**:
  - Đảm bảo `avgAge` trả về dạng số/chuỗi chuẩn định dạng, xử lý an toàn khi rỗng.

### B. Mặc định đóng thẻ thống kê trên toàn app
- **`frontend/src/components/ui/StatsVisibility.tsx`**:
  - Đổi `const [showStats, setShowStats] = useState(false);` (mặc định đóng).
  - Trong `useEffect`: Nếu `localStorage.getItem(storageKey) === "false"` (người dùng đã chủ động bấm "Hiện số liệu"), mới mở `setShowStats(true)`. Nếu chưa lưu hoặc là `"true"`, giữ nguyên trạng thái đóng `false`.
  - Giữ nguyên `aria-expanded` và nút `StatsToggle` ("Hiện số liệu" / "Thu gọn số liệu") để người dùng mở khi cần.

### C. Phân trang đồng bộ toàn bộ danh sách
- **Chuẩn hóa `DataTable.tsx` (`frontend/src/components/ui/DataTable.tsx`)**:
  - Hiển thị thanh phân trang khi có prop `pagination` (hiển thị `"Tổng số X bản ghi · Trang Y / Z"`).
  - Disable nút Trước khi trang 1, disable nút Sau khi ở trang cuối.
- **Áp dụng phân trang client-side đồng bộ (10 mục / trang)**:
  1. **`/nhan-khau` (`frontend/src/app/nhan-khau/page.tsx`)**:
     - Thêm `currentPage`, `PAGE_SIZE = 10`.
     - Reset `currentPage = 1` khi `searchName`, `searchID`, `searchYear`, `searchGender` thay đổi.
     - Cắt `pagedData` và truyền prop `pagination` vào `DataTable`.
  2. **`/ho-khau` (`frontend/src/app/ho-khau/page.tsx`)**:
     - Thêm `currentPage`, `PAGE_SIZE = 10`.
     - Reset `currentPage = 1` khi `searchTerm`, `searchArea`, `filterStatus` thay đổi.
     - Cắt `pagedData` và truyền prop `pagination` vào `DataTable`.
  3. **`/tam-tru-tam-vang` (`frontend/src/app/tam-tru-tam-vang/page.tsx`)**:
     - Thêm `currentPage`, `PAGE_SIZE = 10`.
     - Reset `currentPage = 1` khi `searchTerm`, `statusFilter`, `expiringFilter` thay đổi.
     - Cắt `pagedData` và truyền prop `pagination` vào `DataTable`.
  4. **`/user` (`frontend/src/app/user/page.tsx`)**:
     - Thêm `currentPage`, `PAGE_SIZE = 10`.
     - Reset `currentPage = 1` khi `searchTerm`, `roleFilter`, `statusFilter` thay đổi.
     - Cắt `pagedData` và truyền prop `pagination` vào `DataTable`.
  5. **`/thu-phi` (`frontend/src/app/thu-phi/page.tsx`)**:
     - Thêm `currentPage`, `PAGE_SIZE = 10`.
     - Reset `currentPage = 1` khi filter thay đổi.
     - Cắt dữ liệu hiển thị `pagedData` và thêm thanh phân trang đồng bộ phong cách `DataTable` ở chân bảng.
  6. **`/thu-phi/ve-sinh` (`frontend/src/app/thu-phi/ve-sinh/page.tsx`)**:
     - Thêm `currentPage`, `PAGE_SIZE = 10`.
     - Reset `currentPage = 1` khi filter thay đổi.
     - Cắt dữ liệu hiển thị `pagedData` và thêm thanh phân trang đồng bộ ở chân bảng.
  7. **`/thong-ke` (`frontend/src/app/thong-ke/page.tsx`)**:
     - Đợt thu giữ 6 đợt/trang; bổ sung phân trang 10 hộ/trang cho bảng chi tiết hộ đã nộp và chưa nộp.

---

## 3. Các tệp chỉnh sửa chính
- `D:/Human-Management/backend/src/nhan-khau/nhan-khau.controller.ts`
- `D:/Human-Management/frontend/src/components/ui/StatsVisibility.tsx`
- `D:/Human-Management/frontend/src/components/ui/DataTable.tsx`
- `D:/Human-Management/frontend/src/app/nhan-khau/page.tsx`
- `D:/Human-Management/frontend/src/app/ho-khau/page.tsx`
- `D:/Human-Management/frontend/src/app/tam-tru-tam-vang/page.tsx`
- `D:/Human-Management/frontend/src/app/user/page.tsx`
- `D:/Human-Management/frontend/src/app/thu-phi/page.tsx`
- `D:/Human-Management/frontend/src/app/thu-phi/ve-sinh/page.tsx`
- `D:/Human-Management/frontend/src/app/thong-ke/page.tsx`
- `D:/Human-Management/scripts/verify-admin-ui.mjs`

---

## 4. Kiểm chứng & Đo lường
1. **Kiểm tra kiểu & unit verification:**
   - `npm --prefix frontend exec --no -- tsc --project tsconfig.json --noEmit`
   - `node scripts/verify-admin-ui.mjs`
   - `npm --prefix backend run build`
2. **Kiểm tra trực quan & hành vi (Playwright headless):**
   - Mở `/nhan-khau`: thẻ thống kê mặc định đóng (hiển thị nút "Hiện số liệu"). Bấm nút hiển thị, dữ liệu thực tế được load (khác 0).
   - Kiểm tra các trang `/ho-khau`, `/nhan-khau`, `/tam-tru-tam-vang`, `/user`, `/thu-phi`, `/thu-phi/ve-sinh`: tất cả đều có thanh phân trang 10 mục/trang, chuyển trang mượt mà, đổi bộ lọc tự động về trang 1.
   - Thẻ thống kê ở các trang `/`, `/thong-ke`, `/thu-phi`, v.v. mặc định ở trạng thái đóng.
