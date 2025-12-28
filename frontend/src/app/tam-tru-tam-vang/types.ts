export interface DiaChi {
  soNha?: string;
  duong?: string;
  phuongXa?: string;
  quanHuyen?: string;
  tinhThanh?: string;
}

export interface TamTruTamVang {
  _id?: string;
  id?: string;
  nhanKhauId?: string;
  hoTen: string;
  loai: 'Tạm trú' | 'Tạm vắng';
  tuNgay: string;
  denNgay: string;
  diaChiTamTru?: DiaChi;
  diaChiThuongTru?: DiaChi;
  lyDo?: string;
  noiDen?: string;
  trangThai: 'Đang hiệu lực' | 'Hết hạn' | 'Đã hủy';
  ghiChu?: string;
  nguoiDuyet?: string;
  ngayDuyet?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTamTruTamVangDto {
  nhanKhauId?: string;
  hoTen: string;
  loai: 'Tạm trú' | 'Tạm vắng';
  tuNgay: string;
  denNgay: string;
  diaChiTamTru?: DiaChi;
  diaChiThuongTru?: DiaChi;
  lyDo?: string;
  noiDen?: string;
  ghiChu?: string;
}

export interface UpdateTamTruTamVangDto {
  denNgay?: string;
  trangThai?: 'Đang hiệu lực' | 'Hết hạn' | 'Đã hủy';
  ghiChu?: string;
}