// Types cho Hộ khẩu
export interface DiaChi {
  soNha?: string;
  duong?: string;
  phuongXa?: string;
  quanHuyen?: string;
  tinhThanh?: string;
}

export interface ChuHo {
  nhanKhauId?: string | { _id: string; hoTen?: string };
  hoTen: string;
}

export interface ThanhVien {
  nhanKhauId: string | { _id: string; hoTen?: string; trangThai?: string };
  hoTen: string;
  quanHeVoiChuHo: string;
}

export interface LichSuThayDoi {
  noiDung: string;
  ngayThayDoi: string;
  nguoiThucHien: string;
}

export interface HoKhau {
  _id?: string;
  id?: string;
  chuHo: ChuHo;
  diaChi: DiaChi;
  thanhVien: ThanhVien[];
  trangThai: "Đang hoạt động" | "Đã tách hộ" | "Đã xóa";
  ngayLap?: string;
  ghiChu?: string;
  lichSuThayDoi?: LichSuThayDoi[];
  createdAt?: string;
  updatedAt?: string;
}

// Type cho Nhân khẩu (dùng khi chọn từ danh sách)
export interface NhanKhauBasic {
  _id: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
  trangThai?: string;
  hoKhauId?: string | null;
  quanHeVoiChuHo?: string;
}

// Params cho API tạo hộ khẩu
export interface CreateHoKhauParams {
  chuHo: {
    nhanKhauId: string;
    hoTen: string;
  };
  diaChi: DiaChi;
  trangThai?: string;
  thanhVien?: {
    nhanKhauId: string;
    hoTen: string;
    quanHeVoiChuHo: string;
  }[];
  ghiChu?: string;
}

// Params cho API tách hộ
export interface TachHoParams {
  hoKhauGocId: string;
  chuHoMoi: {
    nhanKhauId: string;
    hoTen: string;
  };
  diaChi: DiaChi;
  danhSachNhanKhauId: string[];
}

// Params cho API đổi chủ hộ
export interface DoiChuHoParams {
  chuHoMoiId: string;
  hoTenChuHoMoi: string;
  lyDo?: string;
}

// Params cho API thêm thành viên
export interface ThemThanhVienParams {
  nhanKhauId: string;
  hoTen: string;
  quanHeVoiChuHo: string;
}
