# Kết quả triển khai giao diện quản trị gọn

## Thay đổi

- Bỏ thanh header desktop sau đăng nhập; giữ thanh mobile 56px.
- Đưa profile, quản trị tài khoản và đăng xuất xuống chân sidebar; xác nhận trước khi đăng xuất.
- Dùng thống nhất thẻ compact và nút ẩn/hiện trên bảy trang: Tổng quan, Nhân khẩu, Báo cáo, Thu phí, Phí vệ sinh, Đóng góp và Thống kê hộ khẩu.
- Ghi nhớ trạng thái theo từng trang; hỗ trợ SSR và fallback khi localStorage bị chặn.
- Giảm khoảng đệm PageHeader, cho nhóm thao tác xuống hàng trên mobile; giữ số liệu và luồng nghiệp vụ.
- Thẻ drilldown thu phí có thể thao tác bằng bàn phím; không hiển thị nút điều khiển thống kê khi chưa có khoản thu tương ứng.

## Kiểm chứng đã chạy

- `node scripts/verify-admin-ui.mjs`: đạt; render component thật và các kiểm tra AST hồi quy cho xác nhận đăng xuất, toggle có điều kiện, nút drilldown và action wrapping.
- `npm --prefix frontend exec -- tsc --project frontend/tsconfig.json --noEmit`: đạt.
- `git diff --check`: đạt.
- Fixture dùng component thật và Tailwind biên dịch, đo bằng Chrome headless: thẻ ngắn desktop cao 61.5px, bo góc 12px; tại viewport 390px thẻ cao 70px do nhãn xuống dòng, không tràn ngang, số tiền dài không tràn khung.
- Đây là kiểm tra fixture, không phải kiểm thử toàn bộ ứng dụng. Server có sẵn ở localhost:3000 trả 404 cho JavaScript chunks, khiến app kẹt tải. Không khởi chạy, dừng hoặc sửa server đó. Không chạy lại production build sau vòng sửa cuối để tránh ghi đè .next đang được server sử dụng.

## Quyết định hiệu chỉnh plan

1. Không tự commit thêm; giữ các commit đã tạo trước đó và thay đổi hiện tại. Nếu cần commit, người dùng phải yêu cầu riêng. Các commit tự động trước đó không nên được hiểu là được người dùng yêu cầu.
2. Gộp phần đồng nhất các trang, shared toggle và sửa trợ năng vì cùng một mẫu giao diện. Đổi lại phạm vi diff lớn hơn nhưng tránh sót các trang thu phí.
3. Dùng các trường thống kê thực tế, giữ thông tin đợt đang chọn thay vì tên trường giả trong plan. Đổi lại không thay thẻ đó bằng một thẻ đếm số đợt riêng.
4. Chiều cao 52–60px là mục tiêu cho nội dung ngắn, không ép cứng. Nội dung dài được xuống dòng; đổi lại một số thẻ cao hơn.
5. Giữ công việc ở feature branch hiện có, không chuyển thay đổi sang worktree. Một số agent đã bị tạo worktree nhầm trong quá trình điều phối; không xóa hoặc reset dữ liệu của chúng. Agent triển khai cuối xác nhận sửa trực tiếp tại D:/Human-Management.
6. Giữ thanh mobile 56px và content offset tương ứng thay vì khoảng 48–52px mâu thuẫn trong spec; đổi lại tốn thêm 4–8px mobile.
7. Dùng một helper nhỏ dùng chung cho persistence và toggle có aria-expanded/controls; đổi lại thêm một module, tránh trùng logic trên từng trang.
8. Giữ ledger và artifact review, không tự xóa; đổi lại còn một số file local được bỏ qua bởi git.

## Review cuối

Review tổng thể phát hiện năm vấn đề: thiếu xác nhận đăng xuất, drilldown không dùng bàn phím được, toggle điều khiển vùng chưa tồn tại, nhóm nút có thể tràn mobile và thiếu kiểm tra hồi quy. Cả năm đã được sửa. Re-review độc lập xác nhận tất cả đã được giải quyết, không thấy lỗi mới trong phạm vi bản sửa; Spec PASS / Quality PASS.

## Trạng thái git

Công việc ở nhánh `feature/compact-admin-layout`. Các sửa cuối chưa commit; không merge/push. File `plans/refine-stat-card-hierarchy.md` có sẵn được giữ nguyên.
