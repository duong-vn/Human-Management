export interface SoDinhDanh {
  loai: 'CMND' | 'CCCD';
  so: string;
  ngayCap?: string;
  noiCap?: string;
}

export interface NhanKhau {
  id?: string; // Backend trả về _id, nhưng FE có thể dùng id
  hoTen: string;
  biDanh: string;
  danToc: string;
  ngaySinh: string; // Dùng string để hứng ISO Date
  gioiTinh: string;

  // QUAN TRỌNG: Đây phải là object
  soDinhDanh: SoDinhDanh;

  // QUAN TRỌNG: Phải đúng chính tả Enum của backend
  trangThai: 'Thường trú' | 'Tạm trú' | 'Tạm vắng' | 'Đã chuyển đi' | 'Đã qua đời';

  hoKhauId: string; // Phải là chuỗi ID Mongo (ví dụ: "6564e...")
  quanHeVoiChuHo: string;

  quocTich: string;
  tonGiao: string;
  queQuan?: string;
  noiSinh?: string;
  ngheNghiep?: string;
  noiLamViec?: string;

  // Địa chỉ cũng là object nếu cần gửi chi tiết
  diaChiThuongTru?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
  };
    diaChiHienTai?: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
  };
}


