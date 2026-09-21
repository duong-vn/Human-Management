# Kế hoạch: Phân cấp thẻ thống kê chính/phụ

**Ngày:** 2026-09-21
**Trạng thái:** Dự thảo

## Context

Hai ảnh người dùng thuộc ứng dụng Human Management: thống kê thu phí và quản lý nhân khẩu. Người dùng không thích màu neon và bốn card ngang có trọng lượng bằng nhau. Thay bằng một card chính lớn bên trái cùng ba card phụ nhỏ bên phải; giữ nguyên nghiệp vụ và dữ liệu.

## Hướng thiết kế theo Impeccable

- Chế độ Operate: ưu tiên đọc nhanh và sử dụng bảng, không thêm trang trí hoặc biểu đồ.
- Desktop: grid hai cột, card chính chiếm khoảng 60% chiều ngang và cao bằng ba card phụ xếp dọc. Card phụ gọn, label và số liệu đọc trong một hàng khi đủ chỗ.
- Thu phí: Tổng thu trong năm là chính; Lượt hộ đã nộp, Lượt hộ chưa nộp và Đợt thu đang chọn là phụ.
- Nhân khẩu: Tổng nhân khẩu là chính; Nam giới, Nữ giới và Tuổi trung bình là phụ.
- Nền trắng/xám slate dịu, viền mảnh; chữ than, icon một tông trầm. Bỏ neon, glow và các mảng màu hồng/tím/xanh sáng trang trí. Giữ trạng thái bằng nhãn rõ nghĩa; không dựa riêng vào màu.
- Số chính lớn hơn, không phóng đại chiều cao; giữ font hiện tại, số tabular. Số 0 vẫn hiển thị; số tiền dài và tên đợt thu được xuống dòng, không ellipsis làm mất dữ liệu.
- Mobile: một cột, card chính trước rồi ba card phụ; DOM và thứ tự đọc không đổi.

## Thực hiện

1. `frontend/src/components/ui/StatCard.tsx`: thêm `variant: default | primary | compact`; mặc định giữ nguyên để không thay đổi các màn hình khác. Primary/compact dùng màu slate, giữ subtitle/trend, số 0 và nội dung dài. Card thông tin không mang affordance nút bấm.
2. `frontend/src/app/thong-ke/page.tsx:403–451`: grid desktop hai cột tỷ lệ 3:2, card tổng thu primary chiếm ba hàng, ba card phụ compact. Giữ formatVND, số lượt, năm, selectedDot và trạng thái.
3. `frontend/src/app/nhan-khau/page.tsx:441–466`: layout tương tự; tổng nhân khẩu primary, còn lại compact. Bỏ class màu cứng trên icon, dùng tông slate. Giữ biểu thức statsData và fallback số 0.
4. Dùng utility Tailwind hiện có; chỉ thêm CSS có phạm vi trong `frontend/src/app/globals.css` nếu thực sự cần. Không thêm component layout hoặc dependency.
5. `scripts/verify-admin-ui.mjs`: mở rộng assertion render StatCard cho default/primary/compact, giữ đủ nội dung, số 0, tiền dài, chưa chọn đợt thu và trạng thái.

## Kiểm chứng

- Chạy kiểm tra component/TypeScript phù hợp và `git diff --check`.
- Một vòng ảnh desktop/mobile, rà dữ liệu 0, tiền dài, chưa chọn đợt thu và loading/error. Sửa cùng một lượt rồi tối đa một vòng xác nhận.
- Chạy Impeccable detector trên các file UI đã đổi; đối chiếu kết quả cơ học với giao diện thực tế.
- Không thao tác dữ liệu production. Nếu cần server local, báo port/PID/lệnh dừng và hỏi tắt hay giữ khi kết thúc.

## Bỏ qua

Không sửa portfolio, CV, backend, migration, API, dependency hoặc toàn bộ design system. Không commit/push/deploy khi chưa được yêu cầu.
