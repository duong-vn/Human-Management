# README chi tiết, ảnh minh họa và xuất bản nhánh hiện tại

## Context
Người dùng muốn README tiếng Việt rất chi tiết cho Human-Management, có thể dùng ảnh chụp màn hình, sau đó commit/push; không thêm assistant vào danh sách đóng góp hoặc attribution commit. Giao diện mới đang nằm trong working tree của nhánh `feature/further-improvements`; remote là `https://github.com/duong-vn/Human-Management`.

Đây là tác vụ tài liệu và xuất bản, không tiếp tục mở rộng tính năng. Giữ nguyên dữ liệu nghiệp vụ; đặc biệt không tự sửa/xóa phiếu ghi nợ tạo nhầm trong lần kiểm thử trước.

## Cách thực hiện
1. Lưu kế hoạch vào `plans/2026-09-21-readme-and-publish.md` ngay khi được phép ghi project. Đọc README hiện tại và đối chiếu nguồn thực tế, không suy diễn từ tài liệu cũ.
2. Viết lại README gốc bằng tiếng Việt, có mục lục và các phần:
   - Giới thiệu, phạm vi sử dụng, tính năng theo phân hệ và giới hạn hiện có.
   - Ảnh giao diện desktop/mobile, trang công khai, dashboard và form trống nếu chụp an toàn được.
   - Công nghệ, kiến trúc frontend/backend/database, sơ đồ Mermaid và cấu trúc thư mục.
   - Điều kiện chạy, cài đặt từng dịch vụ, cấu hình môi trường bằng tên biến và mô tả; không công bố giá trị bí mật hay tài khoản/mật khẩu mẫu.
   - Chạy phát triển, URL/cổng, lệnh build/start/test thực sự có trong package scripts; tránh chạy build đồng thời dev dùng chung `.next`.
   - Đăng nhập/cấp tài khoản và các luồng hộ khẩu, nhân khẩu, cư trú, khoản thu, thu/nợ, báo cáo, cán bộ đúng hành vi hiện tại.
   - Bảng route giao diện, nhóm API và mô hình dữ liệu ở mức tổng quan có căn cứ trong source.
   - Kiểm thử, bảo mật dữ liệu, triển khai, xử lý lỗi thường gặp và giới hạn xác minh.
   - Không thêm danh sách Contributors, badge AI, tên assistant, `Co-Authored-By` hoặc footer ghi công AI. Không tự thêm giấy phép khi repo chưa có.
3. Đặt ảnh được chọn vào `docs/images/`. Tái sử dụng ảnh đã có nếu phù hợp; chụp thêm chỉ thao tác đọc hoặc form trống. Không bấm nút nghiệp vụ có thể gửi mutation. Không đọc/hiện auth storage, cookie, password hoặc request header. Ảnh có dữ liệu cá nhân phải che trước khi lưu công khai; xem lại từng ảnh trước staging.
4. Không sửa backend, CI/CD, cấu hình production, dependency hoặc nghiệp vụ chỉ để README đẹp hơn. Không sửa nội dung lịch sử git, không commit file môi trường, log, `.claude/`, `.playwright-mcp/`, ảnh chưa kiểm tra, hoặc báo cáo sự cố nội bộ chứa ID dữ liệu thật.
5. Kiểm chứng đường dẫn/ảnh/liên kết Markdown, đối chiếu câu lệnh với package scripts. Chạy lại TypeScript và các kiểm tra an toàn có sẵn. Nếu không chạy production build cuối vì server đang phục vụ người dùng, ghi đúng giới hạn; không tuyên bố build cuối đã đạt.
6. Stage theo danh sách cụ thể, không `git add .`. Tạo commit Conventional Commits tách biệt: giao diện và kiểm tra đi cùng; README và ảnh minh họa đi cùng. Dùng danh tính Git hiện có, không sửa author/committer config, không attribution assistant.
7. Kiểm tra staged diff và tên file, xác nhận nhánh/remote, push bình thường lên `origin feature/further-improvements` và thiết lập upstream nếu chưa có. Không force push, không merge main, không tự tạo PR. Nếu remote có cập nhật xung đột, dừng thay vì ghi đè.
8. Xác minh commit trên remote, báo commit hash và link GitHub, ghi rõ nếu có bước không thực hiện được.

## File dự kiến
- Sửa: `README.md`.
- Thêm: `docs/images/` với ảnh minh họa đã xem và kiểm tra riêng tư.
- Thêm: `plans/2026-09-21-readme-and-publish.md`.
- Commit các thay đổi giao diện đã có trong `frontend/src/app/`, `frontend/src/components/`, `scripts/verify-admin-ui.mjs` và kiểm tra ngày cư trú; không gom các artifact nội bộ còn lại.

## Kiểm chứng
- Kiểm tra README không có liên kết nội bộ/ảnh bị thiếu.
- `node scripts/verify-admin-ui.mjs`.
- `node scripts/verify-further-improvements.mjs`.
- `node scripts/verify-performance-strictness.mjs`.
- `node frontend/src/app/tam-tru-tam-vang/utils.test.mjs`.
- `npm --prefix frontend exec --no -- tsc --project frontend/tsconfig.json --noEmit --incremental false`.
- `git diff --check`, kiểm tra staged file list và commit messages.
- Push không force, kiểm tra remote SHA khớp commit local.
