// Types cho Hộ khẩu
export interface DiaChi {
  soNha?: string;
  duong?: string;
  phuongXa?: string;
  quanHuyen?: string;
  tinhThanh?: string;
}

// Thông tin chủ hộ (populated từ NhanKhau)
export interface ChuHoInfo {
  _id: string;
  hoTen: string;
  ngaySinh?: string;
  gioiTinh?: string;
}

// Thành viên (lấy từ NhanKhau)
export interface ThanhVien {
  nhanKhauId: string;
  hoTen: string;
  quanHeVoiChuHo: string;
  ngaySinh?: string;
  gioiTinh?: string;
  trangThai?: string;
}

export interface LichSuThayDoi {
  noiDung: string;
  ngayThayDoi: string;
  nguoiThucHien: string;
}

export interface HoKhau {
  _id?: string;
  id?: string;
  chuHoId: string;
  chuHo?: ChuHoInfo; // Populated từ backend
  diaChi: DiaChi;
  thanhVien: ThanhVien[]; // Computed từ NhanKhau bởi backend
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
  chuHoId: string;
  diaChi: DiaChi;
  trangThai?: string;
  thanhVien?: {
    nhanKhauId: string;
    quanHeVoiChuHo: string;
  }[];
  ghiChu?: string;
}

// Params cho API tách hộ
export interface TachHoParams {
  hoKhauGocId: string;
  chuHoMoi: {
    nhanKhauId: string;
  };
  diaChi: DiaChi;
  danhSachNhanKhauMoi: {
    nhanKhauId: string;
    quanHeVoiChuHo: string;
  }[];
  chuHoMoiChoHoGoc?: {
    nhanKhauId: string;
  };
}

// Params cho API đổi chủ hộ
export interface DoiChuHoParams {
  chuHoMoiId: string;
  lyDo?: string;
}

// Params cho API thêm thành viên
export interface ThemThanhVienParams {
  nhanKhauId: string;
  quanHeVoiChuHo: string;
}
