# Nâng cấp toàn bộ giao diện — Quản trị chuyên nghiệp

## Context
Ứng dụng quản lý tổ dân phố hiện có các trang hộ khẩu, nhân khẩu, cư trú, thu phí, báo cáo và cán bộ. Người dùng muốn thay đổi mạnh về giao diện, giữ nguyên mục đích và nghiệp vụ, đồng thời đồng bộ tất cả các trang. Phong cách đã chọn: **Quản trị chuyên nghiệp** — bảng dữ liệu dễ đọc, bộ lọc rõ, thao tác nhanh.

Nền tảng hiện tại: Next.js 15, React 19, Tailwind CSS 4; đã có thư viện component nội bộ. Vấn đề chính là bố cục và mật độ khác nhau giữa các trang, bảng thu phí tự dựng, form/bộ lọc lặp lại, một số màn hình còn nhận diện cũ. Giải pháp là nâng cấp hệ giao diện chung rồi áp dụng xuyên suốt, không chỉ đổi màu trang chủ.

## Thiết kế đề xuất
- **Khung quản trị:** sidebar xanh navy chia nhóm nghiệp vụ; trạng thái đang chọn rõ ràng; topbar gọn với thông tin phiên hiện có. Nội dung nền xám lạnh, bảng và form nền trắng; màu xanh lam dành cho hành động chính.
- **Phân cấp rõ:** tiêu đề, mô tả ngắn, hành động chính cùng một vị trí trên mọi trang; bộ lọc nằm ngay trên bảng; thông tin phụ dùng màu trung tính. Bỏ các khối trang trí chiếm diện tích làm việc.
- **Mật độ phù hợp:** giữ Nunito có hỗ trợ tiếng Việt, điều chỉnh cỡ chữ và độ đậm; nội dung bảng 13–14px, giãn dòng không cắt dấu; spacing theo nhịp 4/8px, góc bo khoảng 8px, viền mảnh, bóng nhẹ. Tiền và số liệu căn phải, dùng tabular numerals.
- **Một ngôn ngữ thành phần:** button, badge, input/select/textarea, tab, bảng, thẻ thống kê, modal và xác nhận dùng cùng quy tắc kích thước, màu và trạng thái.
- **Responsive thực dụng:** desktop ưu tiên dữ liệu; mobile dùng menu drawer, bộ lọc xếp lại, nút đủ dễ chạm. Bảng dài cuộn ngang trong vùng bảng, không làm tràn toàn trang.
- Không thêm dark mode, biểu đồ mới, dữ liệu minh họa hay tính năng ngoài phạm vi.

## Phạm vi cần đồng bộ
1. **Trang công khai và xác thực:** `/`, `/auth/login`, `/auth/register`; giữ nhận diện tổ dân phố và tách rõ giao diện công khai với workspace đăng nhập. Trang đăng ký cũ chỉ được đồng bộ hình thức và thể hiện đúng trạng thái hiện có, không xây thêm cơ chế đăng ký.
2. **Dashboard và thống kê:** dashboard đăng nhập tại `/`, `/ho-khau/thong-ke`, `/thong-ke`; thống nhất thẻ số liệu, phân cấp báo cáo và bố cục, giữ nguyên nguồn dữ liệu và phép tính.
3. **Danh sách nghiệp vụ:** `/ho-khau`, `/nhan-khau`, `/tam-tru-tam-vang`, `/user`; thống nhất header, toolbar, bảng, phân trang và thao tác dòng.
4. **Tài chính:** `/thu-phi`, `/thu-phi/ve-sinh`, `/thu-phi/dong-gop`; giữ nguyên quy tắc khoản thu, công thức, lọc, ghi nhận thu/nợ và lịch sử.
5. **Mọi màn hình phụ:** form tạo/sửa, chi tiết, lịch sử, tách hộ, đổi chủ hộ, thu tiền và hộp thoại xác nhận thuộc các trang trên; không bỏ sót modal khi chỉ sửa trang danh sách.

## Thứ tự triển khai
### 1. Lưu kế hoạch và xây nền giao diện
Sau khi được phê duyệt, lưu bản kế hoạch vào `plans/2026-09-20-admin-ui-redesign.md` trước khi sửa mã. Plan mode hiện tại chỉ cho phép ghi file kế hoạch được chỉ định của phiên.

Chỉnh `frontend/src/app/globals.css`: màu semantic, typography, surface, border, focus-visible và reduced-motion. Giữ `--font-nunito` và cấu hình font hiện có. Dùng CSS variables và Tailwind hiện có, không thêm thư viện hoặc hệ cấu hình mới.

### 2. Nâng cấp component dùng chung
Tái sử dụng, giữ tương thích API hiện có trong `frontend/src/components/ui/`:
- `Button.tsx`, `Badge.tsx`, `Card.tsx`, `StatCard.tsx`, `PageHeader.tsx`, `Skeleton.tsx`.
- `DataTable.tsx`: header/cell gọn và dễ đọc; vùng cuộn đúng; loading/empty/pagination đồng bộ; header sticky khi thực sự có vùng cuộn dọc. Bổ sung error/retry tùy chọn để phân biệt lỗi API với bảng rỗng, giữ tương thích với các nơi gọi hiện tại. Không tự đổi cách sắp xếp, lọc hay phân trang.
- `Modal.tsx`, `ConfirmDialog.tsx`: header/body/footer nhất quán, chiều cao vừa màn hình, nội dung dài cuộn được. Kiểm tra nhãn dialog, focus trap, trả focus về nút mở, Escape và khóa cuộn; bổ sung phần thiếu trong phạm vi component này.
- Chỉ thêm thành phần nhỏ cho toolbar hoặc field nếu nhiều nơi thực sự cần. Không xây form engine, table engine hay abstraction nghiệp vụ mới.

### 3. Nâng cấp khung điều hướng
Chỉnh `frontend/src/components/MainLayout.tsx`, `Sidebar.tsx`, `Navbar.tsx` và `SidebarContext.tsx` nếu cần:
- Sidebar/topbar/main dùng chung kích thước và khoảng chừa; tránh padding trùng lặp.
- Bỏ giới hạn `max-w-7xl` chung ở workspace quản trị để bảng tận dụng chiều rộng; chỉ giới hạn chiều rộng cục bộ cho nội dung cần đọc/form. Drawer mobile có nhãn, quản lý focus và đóng đúng khi điều hướng.
- Giữ nguyên link, điều kiện hiển thị theo quyền và luồng đăng nhập/đăng xuất. Không thay cơ chế xác thực hoặc tự mở rộng quyền.

### 4. Áp dụng cùng mẫu cho toàn bộ route
Triển khai theo nhóm phạm vi ở trên, ưu tiên danh sách quản trị và tài chính trước, dashboard/công khai/xác thực sau. Các file tiêu biểu:
- `frontend/src/app/ho-khau/page.tsx` và các modal cùng thư mục.
- `frontend/src/app/nhan-khau/page.tsx`, `frontend/src/app/tam-tru-tam-vang/page.tsx`, `frontend/src/app/user/page.tsx` và form/chi tiết liên quan.
- `frontend/src/app/thu-phi/page.tsx`, `frontend/src/app/thu-phi/ve-sinh/page.tsx`, `frontend/src/app/thu-phi/dong-gop/page.tsx`.
- `frontend/src/app/page.tsx`, `frontend/src/app/ho-khau/thong-ke/page.tsx`, `frontend/src/app/thong-ke/page.tsx`, `frontend/src/app/auth/*/page.tsx`.

Bảng tài chính dùng `DataTable` nếu giữ đủ tương tác hiện có; trường hợp đặc thù giữ semantic table nhưng dùng cùng kiểu trình bày. Loại bỏ bố cục `h-screen overflow-hidden`, `min-h-screen` và padding ngoài bị lặp ở các trang con gây cắt nội dung trong shell. Các modal nghiệp vụ tự dựng chuyển sang `Modal`/`ConfirmDialog` hiện có, giữ đủ handler, validation và điều kiện xác nhận. Không thay query, mutation, cache key, payload hay công thức tính tiền. Không đổi trigger lọc chỉ vì thiết kế mới.

### 5. Hoàn thiện trạng thái và accessibility
- Phân biệt đang tải, không có dữ liệu, không có kết quả lọc và lỗi tải; dùng trạng thái query hiện có, không biến lỗi thành số 0.
- Giữ dữ liệu nhập khi API lỗi; giữ validation và xác nhận thao tác phá hủy.
- Mọi input có label; nút chỉ có icon có accessible name; trạng thái có chữ thay vì chỉ màu.
- Giữ thứ tự Tab, focus rõ, độ tương phản phù hợp; không thu nhỏ nút đến mức khó thao tác. Tránh uppercase/truncate thiếu kiểm soát với tên và địa chỉ tiếng Việt.

## Ranh giới thay đổi
- Không đổi backend, schema, migration, CI/CD, phân quyền, public API hoặc luồng nghiệp vụ; không thêm dependency production.
- Không đọc file `.env` hay file có tên chứa `secret`, `credential`, `token`; không ghi hoặc hiển thị thông tin xác thực.
- Bất nhất có sẵn về role `admin` trong điều hướng so với role backend được ghi nhận riêng; không âm thầm sửa phân quyền trong đợt nâng giao diện.
- Không commit/push, xóa file cũ hoặc refactor ngoài phạm vi nếu chưa được yêu cầu.

## Kiểm chứng
1. **Baseline đã chạy và đạt:** `node scripts/verify-further-improvements.mjs`, `node scripts/verify-performance-strictness.mjs`. Chạy lại sau thay đổi để phát hiện hồi quy.
2. **TypeScript baseline đã chạy và đạt:** `npm --prefix frontend exec --no -- tsc --project frontend/tsconfig.json --noEmit --incremental false`. Chạy lại sau thay đổi và chạy `npm --prefix frontend run build`. Không chạy lint thủ công; để hooks xử lý theo hướng dẫn project. Báo riêng nếu build bị chặn bởi môi trường hoặc tải Google Fonts.
3. Thêm một kiểm tra chạy được bằng Node, không framework mới: `scripts/verify-admin-ui.mjs`. Dùng React server rendering/TypeScript sẵn có khi cần để assert cấu trúc semantic của component thực, các trạng thái bảng và nhãn điều khiển; không chỉ kiểm tra chuỗi tên class hay mô phỏng lại logic ứng dụng. Ghi rõ kiểm tra này không thay thế browser test.
4. Dùng Playwright kiểm tra toàn bộ route ở desktop 1440×900 và mobile 390×844; bổ sung tablet 768px và laptop 1366×768 cho shell/bảng dài. Kiểm tra console, tràn ngang, active navigation, menu mobile, modal dài, Tab/Escape, loading/empty/error, search/filter/pagination.
5. Kiểm tra các luồng nhạy cảm: tách hộ/đổi chủ hộ, sửa nhân khẩu, cư trú, thu phí cố định và đóng góp, lịch sử thanh toán. Không gửi thao tác thay đổi dữ liệu thật; kiểm chứng mutation chỉ với dữ liệu test được cho phép. Nếu không có backend/phiên đăng nhập hợp lệ, nêu rõ phạm vi chưa kiểm chứng; không bỏ route guard hoặc đưa dữ liệu giả vào production để chụp giao diện.
6. Nếu khởi chạy dev server, thông báo ngay port, PID, mục đích và lệnh dừng cụ thể; sau kiểm chứng hỏi giữ hay tắt. Không để tiến trình nền tồn tại âm thầm.

## Tiêu chí hoàn thành
Tất cả route và modal dùng chung hệ giao diện quản trị; không còn trang tài chính/đăng ký lệch nhận diện; các nút và nghiệp vụ hiện có được bảo toàn; desktop/mobile không bị cắt nội dung; kết quả kiểm tra và giới hạn xác minh được báo đúng thực tế.
