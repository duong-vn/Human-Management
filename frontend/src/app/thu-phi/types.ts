export type ChiTietThu = {
  khoanThuId: string;
  soTien: number; // Lưu ý: Backend cũng thường yêu cầu đây là number
  ghiChu?: string;
};

export type CreateThuPhiPayload = {
  hoKhauId: string;

  // --- BỔ SUNG DÒNG NÀY ---
  soNhanKhau: number;
  // ------------------------

  // Nếu backend cần lưu snapshot tên chủ hộ/địa chỉ tại thời điểm thu
  // thì bạn có thể cần thêm cả 2 trường dưới (tùy backend yêu cầu hay không):
  tenChuHo?: string;
  diaChi?: string;

  chiTietThu: ChiTietThu[];
  nam: number;
  kyThu: string;
};
