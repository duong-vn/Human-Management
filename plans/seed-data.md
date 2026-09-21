# Kế hoạch triển khai: Seed dữ liệu đầy đủ cho hệ thống

## 1. Mục tiêu
Tạo script seed toàn diện (`backend/src/scripts/seed-all.ts`) sinh dữ liệu giả lập thực tế, nhất quán và đầy đủ quan hệ giữa tất cả 6 schema trong hệ thống:
- **Users**: Tài khoản các vai trò (`to_truong`, `to_pho`, `ke_toan`, `can_bo`).
- **Khoản Thu**: Phí bắt buộc (vệ sinh, an ninh...) và phí tự nguyện/đóng góp (khuyến học, bão lụt, vì người nghèo...).
- **Nhân Khẩu**: Đầy đủ thông tin CCCD, ngày sinh, nghề nghiệp, trạng thái (Thường trú, Tạm trú, Tạm vắng, Đã chuyển đi, Đã qua đời, Mới sinh).
- **Hộ Khẩu**: Chủ hộ và các thành viên (quan hệ vợ, chồng, con, cha mẹ), địa chỉ thực tế tại phường/quận.
- **Tạm Trú / Tạm Vắng**: Hồ sơ tạm trú / tạm vắng liên kết nhân khẩu và người duyệt.
- **Thu Phí**: Phiếu thu gắn với từng hộ khẩu, chi tiết khoản thu, trạng thái `Đã thu`, `Chưa thu`, `Đang nợ`, người thu, năm/kỳ thu.

## 2. Quy mô dữ liệu dự kiến
- **Users**: 4 tài khoản chuẩn (admin, topho, ketoan, canbo).
- **Khoản Thu**: 6 - 8 khoản thu mẫu (3 bắt buộc, 4-5 tự nguyện).
- **Hộ Khẩu**: 15 - 20 hộ gia đình (mỗi hộ 2 - 5 người).
- **Nhân Khẩu**: ~60 - 80 nhân khẩu (gồm cả nhân khẩu trong hộ và nhân khẩu ngoài hộ: tạm trú vãng lai, trẻ mới sinh).
- **Tạm Trú / Tạm Vắng**: 10 - 15 bản ghi (cả đang hiệu lực và hết hạn).
- **Thu Phí**: 30 - 40 phiếu thu rải đều cho các hộ, nhiều trạng thái.

## 3. Quy trình thực hiện
1. **Tuỳ chọn xóa sạch (Reset mode)**: Cung cấp flag `--clean` để dọn sạch collection trước khi seed hoặc cập nhật idempotent để tránh lỗi duplicate key (`soDinhDanh.so`, `maPhieuThu`, `username`).
2. **Nạp cấu hình môi trường**: Đọc an toàn từ `.env`, `.env.development`, `.env.local` qua dotenv/ConfigService.
3. **Thêm npm script**: Cập nhật `backend/package.json` với lệnh `npm run seed` và `npm run seed:clean`.
4. **Kiểm thử script**: Chạy thực tế và kiểm tra tính toàn vẹn dữ liệu (counts & references).
