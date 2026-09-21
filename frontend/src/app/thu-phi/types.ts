export type ChiTietThu = {
  khoanThuId: string;
  tenKhoanThu?: string;
  soTien: number;
  ghiChu?: string;
};

export type CreateKhoanThuPayload = {
  tenKhoanThu: string;
  loaiKhoanThu: string;
  moTa?: string;
  soTien?: number;
  donViTinh?: string;
  ngayBatDau: string;
  ngayKetThuc?: string;
  isActive?: boolean;
  ghiChu?: string;
  tenDotThu?: string;
};

export type CreateThuPhiPayload = {
  maPhieuThu?: string;
  hoKhauId: string;
  tenChuHo?: string;
  diaChi?: string;
  soNhanKhau?: number;
  chiTietThu: ChiTietThu[];
  tongTien?: number;
  ngayThu?: string;
  ghiChu?: string;
  trangThai?: string;
  nam: number;
  kyThu: string;
};

export type UpdateThuPhiPayload = Partial<CreateThuPhiPayload>;
