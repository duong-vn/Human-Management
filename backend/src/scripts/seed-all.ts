import mongoose, { Schema, Types, Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { fakerVI as faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Nạp biến môi trường
dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// 1. Interfaces
interface IDiaChi {
  soNha: string;
  duong: string;
  phuongXa: string;
  quanHuyen: string;
  tinhThanh: string;
}

interface ISoDinhDanh {
  so: string;
  ngayCap: Date;
  noiCap: string;
}

interface IUser {
  _id: Types.ObjectId;
  hoTen: string;
  username: string;
  email: string;
  password: string;
  role: 'to_truong' | 'to_pho' | 'ke_toan' | 'can_bo';
  isActive: boolean;
  soDienThoai: string;
  soDinhDanh?: ISoDinhDanh;
}

interface INhanKhau {
  _id: Types.ObjectId;
  hoTen: string;
  biDanh?: string;
  ngaySinh: Date;
  noiSinh: string;
  queQuan: string;
  danToc: string;
  ngheNghiep: string;
  noiLamViec: string;
  soDinhDanh?: ISoDinhDanh;
  gioiTinh: 'Nam' | 'Nữ';
  tonGiao: string;
  quocTich: string;
  diaChiHienTai: IDiaChi;
  diaChiThuongTru: IDiaChi;
  diaChiCu?: IDiaChi;
  trangThai: 'Thường trú' | 'Tạm trú' | 'Tạm vắng' | 'Đã chuyển đi' | 'Đã qua đời';
  hoKhauId?: Types.ObjectId;
  ngayDangKyThuongTru?: Date;
  ngayChuyenDi?: Date;
  noiChuyenDen?: string;
  lyDoChuyenDi?: string;
  moiSinh: boolean;
  ghiChu?: string;
  quanHeVoiChuHo?: string;
}

interface IThanhVienHoKhau {
  nhanKhauId: Types.ObjectId;
  hoTen: string;
  quanHeVoiChuHo: string;
}

interface IHoKhau {
  _id: Types.ObjectId;
  chuHo: Types.ObjectId;
  diaChi: IDiaChi;
  thanhVien: IThanhVienHoKhau[];
  trangThai: 'Đang hoạt động' | 'Đã tách hộ' | 'Đã xóa';
  ngayLap: Date;
  ghiChu?: string;
  lichSuThayDoi: Array<{
    noiDung: string;
    ngayThayDoi: Date;
    nguoiThucHien: string;
  }>;
}

interface ITamTruTamVang {
  _id: Types.ObjectId;
  nhanKhauId?: Types.ObjectId;
  hoTen: string;
  loai: 'Tạm trú' | 'Tạm vắng';
  tuNgay: Date;
  denNgay: Date;
  diaChiTamTru?: IDiaChi;
  diaChiThuongTru?: IDiaChi;
  lyDo: string;
  noiDen?: string;
  trangThai: 'Đang hiệu lực' | 'Hết hạn' | 'Đã hủy';
  ghiChu?: string;
  nguoiDuyet?: Types.ObjectId;
  ngayDuyet?: Date;
}

interface IKhoanThu {
  _id: Types.ObjectId;
  tenKhoanThu: string;
  loaiKhoanThu: 'Bắt buộc' | 'Tự nguyện';
  moTa: string;
  soTien: number;
  donViTinh: string;
  ngayBatDau: Date;
  ngayKetThuc?: Date;
  isActive: boolean;
  ghiChu?: string;
  tenDotThu?: string;
}

interface IChiTietThu {
  khoanThuId: Types.ObjectId;
  tenKhoanThu: string;
  soTien: number;
  ghiChu?: string;
}

interface IThuPhi {
  _id: Types.ObjectId;
  maPhieuThu: string;
  hoKhauId: Types.ObjectId;
  tenChuHo: string;
  diaChi: string;
  soNhanKhau: number;
  chiTietThu: IChiTietThu[];
  tongTien: number;
  ngayThu: Date;
  nguoiThu?: Types.ObjectId;
  ghiChu?: string;
  trangThai: 'Đã thu' | 'Chưa thu' | 'Đang nợ';
  nam: number;
  kyThu?: string;
}

// 2. Mongoose Schemas (Khớp chính xác định nghĩa NestJS)
const DiaChiSubSchema = new Schema(
  {
    soNha: { type: String, default: '' },
    duong: { type: String, default: '' },
    phuongXa: { type: String, default: '' },
    quanHuyen: { type: String, default: '' },
    tinhThanh: { type: String, default: '' },
  },
  { _id: false },
);

const SoDinhDanhSubSchema = new Schema(
  {
    so: { type: String, sparse: true },
    ngayCap: { type: Date },
    noiCap: { type: String },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    hoTen: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['to_truong', 'to_pho', 'ke_toan', 'can_bo'],
      default: 'can_bo',
    },
    isActive: { type: Boolean, default: true },
    soDienThoai: { type: String },
    soDinhDanh: { type: SoDinhDanhSubSchema },
  },
  { timestamps: true },
);

const NhanKhauSchema = new Schema<INhanKhau>(
  {
    hoTen: { type: String, required: true },
    biDanh: { type: String, default: '' },
    ngaySinh: { type: Date, required: true },
    noiSinh: { type: String },
    queQuan: { type: String },
    danToc: { type: String, default: 'Kinh' },
    ngheNghiep: { type: String },
    noiLamViec: { type: String },
    soDinhDanh: { type: SoDinhDanhSubSchema },
    gioiTinh: { type: String, enum: ['Nam', 'Nữ'], required: true },
    tonGiao: { type: String, default: 'Không' },
    quocTich: { type: String, default: 'Việt Nam' },
    diaChiHienTai: { type: DiaChiSubSchema },
    diaChiThuongTru: { type: DiaChiSubSchema },
    diaChiCu: { type: DiaChiSubSchema },
    trangThai: {
      type: String,
      enum: ['Thường trú', 'Tạm trú', 'Tạm vắng', 'Đã chuyển đi', 'Đã qua đời'],
      default: 'Thường trú',
    },
    hoKhauId: { type: Schema.Types.ObjectId, ref: 'HoKhau' },
    ngayDangKyThuongTru: { type: Date },
    ngayChuyenDi: { type: Date },
    noiChuyenDen: { type: String },
    lyDoChuyenDi: { type: String },
    moiSinh: { type: Boolean, default: false },
    ghiChu: { type: String },
    quanHeVoiChuHo: { type: String },
  },
  { timestamps: true },
);

const HoKhauSchema = new Schema<IHoKhau>(
  {
    chuHo: { type: Schema.Types.ObjectId, ref: 'NhanKhau' },
    diaChi: { type: DiaChiSubSchema, required: true },
    thanhVien: [
      {
        nhanKhauId: { type: Schema.Types.ObjectId, ref: 'NhanKhau', required: true },
        hoTen: { type: String, required: true },
        quanHeVoiChuHo: { type: String, required: true },
      },
    ],
    trangThai: {
      type: String,
      enum: ['Đang hoạt động', 'Đã tách hộ', 'Đã xóa'],
      default: 'Đang hoạt động',
    },
    ngayLap: { type: Date, default: Date.now },
    ghiChu: { type: String },
    lichSuThayDoi: [
      {
        noiDung: { type: String },
        ngayThayDoi: { type: Date },
        nguoiThucHien: { type: String },
      },
    ],
  },
  { timestamps: true },
);

const TamTruTamVangSchema = new Schema<ITamTruTamVang>(
  {
    nhanKhauId: { type: Schema.Types.ObjectId, ref: 'NhanKhau' },
    hoTen: { type: String, required: true },
    loai: { type: String, enum: ['Tạm trú', 'Tạm vắng'], required: true },
    tuNgay: { type: Date, required: true },
    denNgay: { type: Date, required: true },
    diaChiTamTru: { type: DiaChiSubSchema },
    diaChiThuongTru: { type: DiaChiSubSchema },
    lyDo: { type: String },
    noiDen: { type: String },
    trangThai: {
      type: String,
      enum: ['Đang hiệu lực', 'Hết hạn', 'Đã hủy'],
      default: 'Đang hiệu lực',
    },
    ghiChu: { type: String },
    nguoiDuyet: { type: Schema.Types.ObjectId, ref: 'User' },
    ngayDuyet: { type: Date },
  },
  { timestamps: true },
);

const KhoanThuSchema = new Schema<IKhoanThu>(
  {
    tenKhoanThu: { type: String, required: true },
    loaiKhoanThu: {
      type: String,
      enum: ['Bắt buộc', 'Tự nguyện'],
      required: true,
    },
    moTa: { type: String },
    soTien: { type: Number, default: 0 },
    donViTinh: { type: String },
    ngayBatDau: { type: Date, required: true },
    ngayKetThuc: { type: Date },
    isActive: { type: Boolean, default: true },
    ghiChu: { type: String },
    tenDotThu: { type: String },
  },
  { timestamps: true },
);

const ThuPhiSchema = new Schema<IThuPhi>(
  {
    maPhieuThu: { type: String, required: true, unique: true },
    hoKhauId: { type: Schema.Types.ObjectId, ref: 'HoKhau', required: true },
    tenChuHo: { type: String, required: true },
    diaChi: { type: String, required: true },
    soNhanKhau: { type: Number, required: true },
    chiTietThu: [
      {
        khoanThuId: { type: Schema.Types.ObjectId, ref: 'KhoanThu' },
        tenKhoanThu: { type: String },
        soTien: { type: Number },
        ghiChu: { type: String },
      },
    ],
    tongTien: { type: Number, required: true },
    ngayThu: { type: Date, required: true },
    nguoiThu: { type: Schema.Types.ObjectId, ref: 'User' },
    ghiChu: { type: String },
    trangThai: {
      type: String,
      enum: ['Đã thu', 'Chưa thu', 'Đang nợ'],
      default: 'Chưa thu',
    },
    nam: { type: Number, required: true },
    kyThu: { type: String },
  },
  { timestamps: true },
);

// Models
const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
const NhanKhauModel: Model<INhanKhau> = mongoose.model<INhanKhau>('NhanKhau', NhanKhauSchema);
const HoKhauModel: Model<IHoKhau> = mongoose.model<IHoKhau>('HoKhau', HoKhauSchema);
const TamTruTamVangModel: Model<ITamTruTamVang> = mongoose.model<ITamTruTamVang>('TamTruTamVang', TamTruTamVangSchema);
const KhoanThuModel: Model<IKhoanThu> = mongoose.model<IKhoanThu>('KhoanThu', KhoanThuSchema);
const ThuPhiModel: Model<IThuPhi> = mongoose.model<IThuPhi>('ThuPhi', ThuPhiSchema);

// 3. Dữ liệu cố định & Generator
const PHO_LIST = [
  'Đại Cồ Việt',
  'Trần Đại Nghĩa',
  'Tạ Quang Bửu',
  'Lê Thanh Nghị',
  'Bạch Mai',
  'Giải Phóng',
  'Phố Vọng',
  'Hoa Lư',
];

const PHUONG_LIST = [
  'Phường Bách Khoa',
  'Phường Đồng Tâm',
  'Phường Lê Đại Hành',
];

const QUAN_NAME = 'Quận Hai Bà Trưng';
const TINH_NAME = 'Hà Nội';

function taoDiaChi(soNha?: string, duong?: string): IDiaChi {
  return {
    soNha: soNha || String(faker.number.int({ min: 1, max: 250 })),
    duong: duong || faker.helpers.arrayElement(PHO_LIST),
    phuongXa: faker.helpers.arrayElement(PHUONG_LIST),
    quanHuyen: QUAN_NAME,
    tinhThanh: TINH_NAME,
  };
}

function diaChiToString(dc: IDiaChi): string {
  return `${dc.soNha} ${dc.duong}, ${dc.phuongXa}, ${dc.quanHuyen}, ${dc.tinhThanh}`;
}

const cccdSet = new Set<string>();
function taoCCCD(namSinh: number, gioiTinh: 'Nam' | 'Nữ'): ISoDinhDanh {
  // Quy tắc CCCD Việt Nam: 001 (Hà Nội) + thế kỷ & giới tính + 2 số cuối năm sinh + 6 số ngẫu nhiên
  let theKyGioiTinh = '0';
  if (namSinh >= 2000) {
    theKyGioiTinh = gioiTinh === 'Nam' ? '2' : '3';
  } else {
    theKyGioiTinh = gioiTinh === 'Nam' ? '0' : '1';
  }

  const namStr = String(namSinh).slice(-2);
  let so = '';
  do {
    const random6 = String(faker.number.int({ min: 100000, max: 999999 }));
    so = `001${theKyGioiTinh}${namStr}${random6}`;
  } while (cccdSet.has(so));

  cccdSet.add(so);

  const ngayCap = new Date(Math.max(namSinh + 14, 2016), faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 }));
  return {
    so,
    ngayCap,
    noiCap: 'Cục CSQLHC về TTXH',
  };
}

async function seedAll() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Thiếu MONGODB_URI trong biến môi trường');
    process.exit(1);
  }

  console.log('⚡ Đang kết nối MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Kết nối thành công!');

  console.log('🧹 Đang dọn dẹp dữ liệu cũ...');
  await Promise.all([
    UserModel.deleteMany({}),
    KhoanThuModel.deleteMany({}),
    NhanKhauModel.deleteMany({}),
    HoKhauModel.deleteMany({}),
    TamTruTamVangModel.deleteMany({}),
    ThuPhiModel.deleteMany({}),
  ]);
  console.log('✅ Đã xóa sạch dữ liệu cũ!');

  // ================= 1. SEED USERS =================
  console.log('🌱 Đang tạo danh sách tài khoản Users...');
  const defaultPassword = await bcrypt.hash('123123', 10);
  const usersToInsert: IUser[] = [
    {
      _id: new Types.ObjectId(),
      hoTen: 'Nguyễn Văn Minh (Tổ trưởng)',
      username: 'admin',
      email: 'admin@gmail.com',
      password: defaultPassword,
      role: 'to_truong',
      isActive: true,
      soDienThoai: '0901234567',
      soDinhDanh: taoCCCD(1975, 'Nam'),
    },
    {
      _id: new Types.ObjectId(),
      hoTen: 'Trần Thị Mai (Tổ phó)',
      username: 'topho',
      email: 'topho@gmail.com',
      password: defaultPassword,
      role: 'to_pho',
      isActive: true,
      soDienThoai: '0912345678',
      soDinhDanh: taoCCCD(1980, 'Nữ'),
    },
    {
      _id: new Types.ObjectId(),
      hoTen: 'Lê Thu Trang (Kế toán)',
      username: 'ketoan1',
      email: 'ketoan1@gmail.com',
      password: defaultPassword,
      role: 'ke_toan',
      isActive: true,
      soDienThoai: '0923456789',
      soDinhDanh: taoCCCD(1988, 'Nữ'),
    },
    {
      _id: new Types.ObjectId(),
      hoTen: 'Phạm Đức Dũng (Cán bộ phụ trách)',
      username: 'canbo1',
      email: 'canbo1@gmail.com',
      password: defaultPassword,
      role: 'can_bo',
      isActive: true,
      soDienThoai: '0934567890',
      soDinhDanh: taoCCCD(1992, 'Nam'),
    },
  ];

  await UserModel.insertMany(usersToInsert);
  console.log(`✓ Đã tạo ${usersToInsert.length} Users`);

  // ================= 2. SEED KHOẢN THU =================
  console.log('🌱 Đang tạo danh mục Khoản Thu...');
  const khoanThuToInsert: IKhoanThu[] = [
    {
      _id: new Types.ObjectId(),
      tenKhoanThu: 'Phí vệ sinh môi trường 2026',
      loaiKhoanThu: 'Bắt buộc',
      moTa: 'Thu gom và vận chuyển rác sinh hoạt khu dân cư',
      soTien: 60000,
      donViTinh: 'VNĐ/hộ/tháng',
      ngayBatDau: new Date(2026, 0, 1),
      ngayKetThuc: new Date(2026, 11, 31),
      isActive: true,
      ghiChu: 'Mức thu thống nhất toàn tổ dân phố',
    },
    {
      _id: new Types.ObjectId(),
      tenKhoanThu: 'Phí an ninh trật tự 2026',
      loaiKhoanThu: 'Bắt buộc',
      moTa: 'Chi phí tuần tra, hỗ trợ lực lượng bảo vệ an ninh cơ sở',
      soTien: 30000,
      donViTinh: 'VNĐ/hộ/tháng',
      ngayBatDau: new Date(2026, 0, 1),
      ngayKetThuc: new Date(2026, 11, 31),
      isActive: true,
      ghiChu: 'Nghị quyết HĐND phường',
    },
    {
      _id: new Types.ObjectId(),
      tenKhoanThu: 'Phí đóng góp xây dựng nhà văn hóa',
      loaiKhoanThu: 'Bắt buộc',
      moTa: 'Sửa chữa và mua sắm thiết bị âm thanh nhà sinh hoạt cộng đồng',
      soTien: 150000,
      donViTinh: 'VNĐ/hộ/năm',
      ngayBatDau: new Date(2026, 1, 1),
      ngayKetThuc: new Date(2026, 5, 30),
      isActive: true,
      ghiChu: 'Đợt 1 năm 2026',
    },
    {
      _id: new Types.ObjectId(),
      tenKhoanThu: 'Quỹ vì người nghèo năm 2026',
      loaiKhoanThu: 'Tự nguyện',
      moTa: 'Ủng hộ các hộ có hoàn cảnh đặc biệt khó khăn trong phường',
      soTien: 0,
      donViTinh: 'VNĐ/hộ (tùy tâm)',
      ngayBatDau: new Date(2026, 0, 1),
      ngayKetThuc: new Date(2026, 11, 31),
      isActive: true,
      tenDotThu: 'Tháng cao điểm vì người nghèo',
      ghiChu: 'Khuyến khích đóng góp từ 50.000 VNĐ',
    },
    {
      _id: new Types.ObjectId(),
      tenKhoanThu: 'Quỹ khuyến học - khuyến tài 2026',
      loaiKhoanThu: 'Tự nguyện',
      moTa: 'Khen thưởng học sinh giỏi, học sinh nghèo vượt khó dịp 1/6 và khai giảng',
      soTien: 0,
      donViTinh: 'VNĐ/hộ (tùy tâm)',
      ngayBatDau: new Date(2026, 0, 1),
      ngayKetThuc: new Date(2026, 11, 31),
      isActive: true,
      tenDotThu: 'Tiếp bước em đến trường',
    },
    {
      _id: new Types.ObjectId(),
      tenKhoanThu: 'Ủng hộ đồng bào bão lụt miền Trung',
      loaiKhoanThu: 'Tự nguyện',
      moTa: 'Quyên góp cứu trợ khẩn cấp khắc phục hậu quả thiên tai',
      soTien: 0,
      donViTinh: 'VNĐ/hộ (tùy tâm)',
      ngayBatDau: new Date(2025, 8, 1),
      ngayKetThuc: new Date(2025, 11, 31),
      isActive: false,
      tenDotThu: 'Cứu trợ khẩn cấp năm 2025',
    },
    {
      _id: new Types.ObjectId(),
      tenKhoanThu: 'Quỹ đền ơn đáp nghĩa 27/7',
      loaiKhoanThu: 'Tự nguyện',
      moTa: 'Thăm hỏi các gia đình chính sách, thương binh liệt sĩ',
      soTien: 0,
      donViTinh: 'VNĐ/hộ (tùy tâm)',
      ngayBatDau: new Date(2026, 5, 1),
      ngayKetThuc: new Date(2026, 7, 31),
      isActive: true,
      tenDotThu: 'Uống nước nhớ nguồn 2026',
    },
  ];

  await KhoanThuModel.insertMany(khoanThuToInsert);
  console.log(`✓ Đã tạo ${khoanThuToInsert.length} Khoản Thu`);

  // ================= 3. SEED HỘ KHẨU & NHÂN KHẨU =================
  console.log('🌱 Đang sinh dữ liệu Hộ Khẩu và Nhân Khẩu...');
  const hoKhauList: IHoKhau[] = [];
  const nhanKhauList: INhanKhau[] = [];

  const SO_HO_KHAU = 16;
  const NGHE_NGHIEP_LIST = [
    'Giáo viên',
    'Kỹ sư phần mềm',
    'Bác sĩ',
    'Công nhân',
    'Kế toán',
    'Kinh doanh tự do',
    'Nhân viên văn phòng',
    'Nghỉ hưu',
    'Sinh viên',
    'Học sinh',
  ];

  for (let h = 1; h <= SO_HO_KHAU; h++) {
    const hoKhauId = new Types.ObjectId();
    const diaChiHo = taoDiaChi(`${h * 6}`, PHO_LIST[h % PHO_LIST.length]);

    // Tạo Chủ hộ
    const chuHoId = new Types.ObjectId();
    const chuHoGender: 'Nam' | 'Nữ' = h % 3 === 0 ? 'Nữ' : 'Nam';
    const chuHoBirthYear = 1955 + (h % 30);
    const chuHoTen = faker.person.fullName({ sex: chuHoGender === 'Nam' ? 'male' : 'female' });

    const chuHo: INhanKhau = {
      _id: chuHoId,
      hoTen: chuHoTen,
      biDanh: '',
      ngaySinh: new Date(chuHoBirthYear, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 })),
      noiSinh: TINH_NAME,
      queQuan: TINH_NAME,
      danToc: 'Kinh',
      ngheNghiep: chuHoBirthYear < 1965 ? 'Nghỉ hưu' : faker.helpers.arrayElement(NGHE_NGHIEP_LIST),
      noiLamViec: chuHoBirthYear < 1965 ? 'Hưu trí' : faker.company.name(),
      soDinhDanh: taoCCCD(chuHoBirthYear, chuHoGender),
      gioiTinh: chuHoGender,
      tonGiao: 'Không',
      quocTich: 'Việt Nam',
      diaChiHienTai: diaChiHo,
      diaChiThuongTru: diaChiHo,
      trangThai: 'Thường trú',
      hoKhauId: hoKhauId,
      ngayDangKyThuongTru: new Date(2015 + (h % 8), faker.number.int({ min: 0, max: 11 }), 1),
      moiSinh: false,
      quanHeVoiChuHo: 'Chủ hộ',
    };
    nhanKhauList.push(chuHo);

    const thanhVienHo: IThanhVienHoKhau[] = [
      {
        nhanKhauId: chuHoId,
        hoTen: chuHoTen,
        quanHeVoiChuHo: 'Chủ hộ',
      },
    ];

    // Tạo Vợ / Chồng
    const spouseGender: 'Nam' | 'Nữ' = chuHoGender === 'Nam' ? 'Nữ' : 'Nam';
    const spouseBirthYear = chuHoBirthYear + faker.number.int({ min: -3, max: 3 });
    const spouseId = new Types.ObjectId();
    const spouseTen = faker.person.fullName({ sex: spouseGender === 'Nam' ? 'male' : 'female' });

    const spouse: INhanKhau = {
      _id: spouseId,
      hoTen: spouseTen,
      biDanh: '',
      ngaySinh: new Date(spouseBirthYear, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 })),
      noiSinh: TINH_NAME,
      queQuan: TINH_NAME,
      danToc: 'Kinh',
      ngheNghiep: spouseBirthYear < 1965 ? 'Nghỉ hưu' : faker.helpers.arrayElement(NGHE_NGHIEP_LIST),
      noiLamViec: spouseBirthYear < 1965 ? 'Hưu trí' : faker.company.name(),
      soDinhDanh: taoCCCD(spouseBirthYear, spouseGender),
      gioiTinh: spouseGender,
      tonGiao: 'Không',
      quocTich: 'Việt Nam',
      diaChiHienTai: diaChiHo,
      diaChiThuongTru: diaChiHo,
      trangThai: 'Thường trú',
      hoKhauId: hoKhauId,
      ngayDangKyThuongTru: new Date(2015 + (h % 8), faker.number.int({ min: 0, max: 11 }), 1),
      moiSinh: false,
      quanHeVoiChuHo: chuHoGender === 'Nam' ? 'Vợ' : 'Chồng',
    };
    nhanKhauList.push(spouse);
    thanhVienHo.push({
      nhanKhauId: spouseId,
      hoTen: spouseTen,
      quanHeVoiChuHo: spouse.quanHeVoiChuHo!,
    });

    // Tạo các Con (1 - 3 người con tùy hộ)
    const soCon = (h % 3) + 1;
    for (let c = 1; c <= soCon; c++) {
      const childId = new Types.ObjectId();
      const childGender: 'Nam' | 'Nữ' = c % 2 === 0 ? 'Nữ' : 'Nam';

      // Hộ số 5 có 1 trẻ mới sinh
      const isMoiSinh = h === 5 && c === soCon;
      const childBirthYear = isMoiSinh
        ? 2026
        : Math.min(2024, chuHoBirthYear + 25 + (c * 3));

      const childTen = faker.person.fullName({ sex: childGender === 'Nam' ? 'male' : 'female' });
      const quanHeCon = childGender === 'Nam' ? 'Con trai' : 'Con gái';

      let trangThaiCon: INhanKhau['trangThai'] = 'Thường trú';
      if (h === 4 && c === 1) {
        trangThaiCon = 'Tạm vắng'; // Con đi học đại học/công tác nước ngoài
      }

      const child: INhanKhau = {
        _id: childId,
        hoTen: childTen,
        biDanh: '',
        ngaySinh: isMoiSinh
          ? new Date(2026, 1, faker.number.int({ min: 1, max: 20 }))
          : new Date(childBirthYear, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 })),
        noiSinh: TINH_NAME,
        queQuan: TINH_NAME,
        danToc: 'Kinh',
        ngheNghiep: isMoiSinh ? 'Mới sinh' : childBirthYear > 2008 ? 'Học sinh' : 'Nhân viên văn phòng',
        noiLamViec: isMoiSinh ? '' : childBirthYear > 2008 ? 'Trường THPT Thăng Long' : faker.company.name(),
        soDinhDanh: childBirthYear <= 2012 ? taoCCCD(childBirthYear, childGender) : undefined,
        gioiTinh: childGender,
        tonGiao: 'Không',
        quocTich: 'Việt Nam',
        diaChiHienTai: diaChiHo,
        diaChiThuongTru: diaChiHo,
        trangThai: trangThaiCon,
        hoKhauId: hoKhauId,
        ngayDangKyThuongTru: new Date(childBirthYear, 1, 1),
        moiSinh: isMoiSinh,
        quanHeVoiChuHo: quanHeCon,
        ghiChu: isMoiSinh ? 'Trẻ khai sinh đầu năm 2026' : undefined,
      };

      nhanKhauList.push(child);
      thanhVienHo.push({
        nhanKhauId: childId,
        hoTen: childTen,
        quanHeVoiChuHo: quanHeCon,
      });
    }

    const hoKhauDoc: IHoKhau = {
      _id: hoKhauId,
      chuHo: chuHoId,
      diaChi: diaChiHo,
      thanhVien: thanhVienHo,
      trangThai: 'Đang hoạt động',
      ngayLap: new Date(2015 + (h % 8), faker.number.int({ min: 0, max: 11 }), 10),
      ghiChu: `Hộ gia đình số ${h}`,
      lichSuThayDoi: [
        {
          noiDung: 'Đăng ký hộ khẩu thường trú ban đầu',
          ngayThayDoi: new Date(2015 + (h % 8), 0, 15),
          nguoiThucHien: 'Cán bộ tư pháp',
        },
      ],
    };
    hoKhauList.push(hoKhauDoc);
  }

  // ================= 4. NHÂN KHẨU NGOÀI HỘ =================
  // a) Nhân khẩu tạm trú (sinh viên, người lao động từ tỉnh khác đến)
  const nhanKhauTamTruList: INhanKhau[] = [];
  for (let i = 1; i <= 6; i++) {
    const gender: 'Nam' | 'Nữ' = i % 2 === 0 ? 'Nữ' : 'Nam';
    const birthYear = 1998 + (i % 6);
    const ten = faker.person.fullName({ sex: gender === 'Nam' ? 'male' : 'female' });
    const que = faker.helpers.arrayElement(['Nam Định', 'Thái Bình', 'Nghệ An', 'Hải Phòng', 'Bắc Ninh']);
    const diaChiQue: IDiaChi = {
      soNha: `${i * 12}`,
      duong: 'Đường liên xã',
      phuongXa: 'Xã Tân Dân',
      quanHuyen: 'Huyện Thường Tín',
      tinhThanh: que,
    };
    const diaChiTro = taoDiaChi(`${i * 15} Ngõ 205`, 'Giải Phóng');

    nhanKhauTamTruList.push({
      _id: new Types.ObjectId(),
      hoTen: ten,
      biDanh: '',
      ngaySinh: new Date(birthYear, faker.number.int({ min: 0, max: 11 }), faker.number.int({ min: 1, max: 28 })),
      noiSinh: que,
      queQuan: que,
      danToc: 'Kinh',
      ngheNghiep: birthYear >= 2003 ? 'Sinh viên' : 'Kỹ sư công nghệ',
      noiLamViec: birthYear >= 2003 ? 'Đại học Bách Khoa Hà Nội' : 'Khu công nghệ cao',
      soDinhDanh: taoCCCD(birthYear, gender),
      gioiTinh: gender,
      tonGiao: 'Không',
      quocTich: 'Việt Nam',
      diaChiHienTai: diaChiTro,
      diaChiThuongTru: diaChiQue,
      trangThai: 'Tạm trú',
      moiSinh: false,
      quanHeVoiChuHo: 'Tạm trú ngoài hộ',
      ghiChu: 'Tạm trú thuê nhà sinh sống và làm việc',
    });
  }

  // b) Nhân khẩu đã chuyển đi
  const nhanKhauChuyenDi: INhanKhau = {
    _id: new Types.ObjectId(),
    hoTen: 'Vũ Quốc Khánh',
    biDanh: '',
    ngaySinh: new Date(1990, 4, 18),
    noiSinh: TINH_NAME,
    queQuan: 'Hà Nam',
    danToc: 'Kinh',
    ngheNghiep: 'Chuyên viên tài chính',
    noiLamViec: 'Ngân hàng Vietcombank',
    soDinhDanh: taoCCCD(1990, 'Nam'),
    gioiTinh: 'Nam',
    tonGiao: 'Không',
    quocTich: 'Việt Nam',
    diaChiHienTai: taoDiaChi('Tòa S2.05 Vinhome Smart City', 'Đại Mỗ'),
    diaChiThuongTru: taoDiaChi('Số 12', 'Tạ Quang Bửu'),
    diaChiCu: taoDiaChi('Số 12', 'Tạ Quang Bửu'),
    trangThai: 'Đã chuyển đi',
    ngayChuyenDi: new Date(2025, 10, 15),
    noiChuyenDen: 'Phường Tây Mỗ, Quận Nam Từ Liêm, Hà Nội',
    lyDoChuyenDi: 'Mua nhà chuyển nơi thường trú mới',
    moiSinh: false,
    ghiChu: 'Đã hoàn tất thủ tục cắt chuyển khẩu',
  };

  // c) Nhân khẩu đã qua đời
  const nhanKhauQuaDoi: INhanKhau = {
    _id: new Types.ObjectId(),
    hoTen: 'Bùi Thị Lành',
    biDanh: '',
    ngaySinh: new Date(1938, 2, 10),
    noiSinh: TINH_NAME,
    queQuan: TINH_NAME,
    danToc: 'Kinh',
    ngheNghiep: 'Hưu trí',
    noiLamViec: 'Hưu trí',
    soDinhDanh: taoCCCD(1938, 'Nữ'),
    gioiTinh: 'Nữ',
    tonGiao: 'Không',
    quocTich: 'Việt Nam',
    diaChiHienTai: taoDiaChi('Số 48', 'Lê Thanh Nghị'),
    diaChiThuongTru: taoDiaChi('Số 48', 'Lê Thanh Nghị'),
    trangThai: 'Đã qua đời',
    moiSinh: false,
    ghiChu: 'Đã khai tử tháng 11/2025',
  };

  nhanKhauList.push(...nhanKhauTamTruList, nhanKhauChuyenDi, nhanKhauQuaDoi);

  await NhanKhauModel.insertMany(nhanKhauList);
  await HoKhauModel.insertMany(hoKhauList);
  console.log(`✓ Đã tạo ${hoKhauList.length} Hộ Khẩu`);
  console.log(`✓ Đã tạo ${nhanKhauList.length} Nhân Khẩu`);

  // ================= 5. SEED TẠM TRÚ / TẠM VẮNG =================
  console.log('🌱 Đang tạo hồ sơ Tạm Trú / Tạm Vắng...');
  const canBoDuyet = usersToInsert[0]._id; // Admin / Tổ trưởng duyệt
  const tamTruTamVangList: ITamTruTamVang[] = [];

  // Hồ sơ Tạm Trú cho các bạn sinh viên/người làm thuê
  for (let i = 0; i < nhanKhauTamTruList.length; i++) {
    const nk = nhanKhauTamTruList[i];
    const isHetHan = i >= 4;
    const tuNgay = isHetHan ? new Date(2024, 0, 15) : new Date(2025, 8, 1);
    const denNgay = isHetHan ? new Date(2025, 0, 15) : new Date(2026, 8, 1);

    tamTruTamVangList.push({
      _id: new Types.ObjectId(),
      nhanKhauId: nk._id,
      hoTen: nk.hoTen,
      loai: 'Tạm trú',
      tuNgay,
      denNgay,
      diaChiTamTru: nk.diaChiHienTai,
      diaChiThuongTru: nk.diaChiThuongTru,
      lyDo: i % 2 === 0 ? 'Thuê trọ học tập tại trường ĐH Bách Khoa' : 'Lao động làm việc tại công ty trên địa bàn',
      trangThai: isHetHan ? 'Hết hạn' : 'Đang hiệu lực',
      ghiChu: isHetHan ? 'Đã hết hạn tạm trú 12 tháng' : 'Đăng ký tạm trú đúng quy định',
      nguoiDuyet: canBoDuyet,
      ngayDuyet: tuNgay,
    });
  }

  // Hồ sơ Tạm Vắng cho nhân khẩu thường trú (tìm nhân khẩu tạm vắng đã tạo ở Hộ số 4)
  const nhanKhauTamVang = nhanKhauList.find((nk) => nk.trangThai === 'Tạm vắng');
  if (nhanKhauTamVang) {
    tamTruTamVangList.push({
      _id: new Types.ObjectId(),
      nhanKhauId: nhanKhauTamVang._id,
      hoTen: nhanKhauTamVang.hoTen,
      loai: 'Tạm vắng',
      tuNgay: new Date(2025, 9, 1),
      denNgay: new Date(2026, 9, 1),
      diaChiThuongTru: nhanKhauTamVang.diaChiThuongTru,
      noiDen: 'Ký túc xá Đại học Quốc gia TP. Hồ Chí Minh',
      lyDo: 'Đi học đại học tập trung',
      trangThai: 'Đang hiệu lực',
      ghiChu: 'Tạm vắng đi học xa nhà',
      nguoiDuyet: canBoDuyet,
      ngayDuyet: new Date(2025, 8, 25),
    });
  }

  await TamTruTamVangModel.insertMany(tamTruTamVangList);
  console.log(`✓ Đã tạo ${tamTruTamVangList.length} hồ sơ Tạm Trú / Tạm Vắng`);

  // ================= 6. SEED THU PHÍ =================
  console.log('🌱 Đang tạo danh sách Phiếu Thu Phí...');
  const keToanUser = usersToInsert[2]._id; // Lê Thu Trang
  const thuPhiList: IThuPhi[] = [];

  const khoanVeSinh = khoanThuToInsert[0];
  const khoanAnNinh = khoanThuToInsert[1];
  const khoanNhaVanHoa = khoanThuToInsert[2];
  const khoanViNguoiNgheo = khoanThuToInsert[3];
  const khoanKhuyenHoc = khoanThuToInsert[4];

  let phieuIndex = 1;

  // Tạo phiếu thu năm 2026 cho từng hộ khẩu
  for (let i = 0; i < hoKhauList.length; i++) {
    const hk = hoKhauList[i];
    const chuHoNk = nhanKhauList.find((nk) => nk._id.equals(hk.chuHo));
    const tenChuHo = chuHoNk ? chuHoNk.hoTen : 'Chủ hộ';
    const soNhanKhau = hk.thanhVien.length;
    const diaChiStr = diaChiToString(hk.diaChi);

    // 1) Phiếu thu Quý 1/2026 (Phí vệ sinh 3 tháng + An ninh 3 tháng)
    const tienVeSinh3Thang = khoanVeSinh.soTien * 3; // 180.000
    const tienAnNinh3Thang = khoanAnNinh.soTien * 3; // 90.000
    const chiTietQ1: IChiTietThu[] = [
      {
        khoanThuId: khoanVeSinh._id,
        tenKhoanThu: khoanVeSinh.tenKhoanThu,
        soTien: tienVeSinh3Thang,
        ghiChu: 'Nộp Quý 1/2026 (3 tháng)',
      },
      {
        khoanThuId: khoanAnNinh._id,
        tenKhoanThu: khoanAnNinh.tenKhoanThu,
        soTien: tienAnNinh3Thang,
        ghiChu: 'Nộp Quý 1/2026 (3 tháng)',
      },
    ];

    // Một số hộ đóng góp thêm quỹ tự nguyện
    if (i % 2 === 0) {
      const tienUngHo = faker.helpers.arrayElement([100000, 200000, 500000]);
      chiTietQ1.push({
        khoanThuId: khoanViNguoiNgheo._id,
        tenKhoanThu: khoanViNguoiNgheo.tenKhoanThu,
        soTien: tienUngHo,
        ghiChu: 'Gia đình tự nguyện ủng hộ',
      });
    }

    const tongTienQ1 = chiTietQ1.reduce((sum, ct) => sum + ct.soTien, 0);

    // Trạng thái thu
    let trangThaiQ1: IThuPhi['trangThai'] = 'Đã thu';
    if (i === 2 || i === 7) {
      trangThaiQ1 = 'Chưa thu';
    } else if (i === 11) {
      trangThaiQ1 = 'Đang nợ';
    }

    const maPhieuQ1 = `PT-2026-${String(phieuIndex++).padStart(4, '0')}`;
    thuPhiList.push({
      _id: new Types.ObjectId(),
      maPhieuThu: maPhieuQ1,
      hoKhauId: hk._id,
      tenChuHo,
      diaChi: diaChiStr,
      soNhanKhau,
      chiTietThu: chiTietQ1,
      tongTien: tongTienQ1,
      ngayThu: new Date(2026, 0, faker.number.int({ min: 5, max: 25 })),
      nguoiThu: keToanUser,
      ghiChu: trangThaiQ1 === 'Đang nợ' ? 'Hộ hẹn nộp sau tết Nguyên Đán' : 'Thu tiền định kỳ tổ dân phố',
      trangThai: trangThaiQ1,
      nam: 2026,
      kyThu: 'Quý 1 - 2026',
    });

    // 2) Phiếu thu đóng góp xây dựng nhà văn hóa 2026 cho 10 hộ đầu
    if (i < 10) {
      const chiTietNVH: IChiTietThu[] = [
        {
          khoanThuId: khoanNhaVanHoa._id,
          tenKhoanThu: khoanNhaVanHoa.tenKhoanThu,
          soTien: khoanNhaVanHoa.soTien,
          ghiChu: 'Khoản thu theo hộ gia đình',
        },
      ];
      if (i % 3 === 0) {
        chiTietNVH.push({
          khoanThuId: khoanKhuyenHoc._id,
          tenKhoanThu: khoanKhuyenHoc.tenKhoanThu,
          soTien: 100000,
          ghiChu: 'Ủng hộ quỹ khuyến học tổ',
        });
      }

      const tongNVH = chiTietNVH.reduce((sum, ct) => sum + ct.soTien, 0);
      const maPhieuNVH = `PT-2026-${String(phieuIndex++).padStart(4, '0')}`;
      const trangThaiNVH: IThuPhi['trangThai'] = i % 4 === 0 ? 'Chưa thu' : 'Đã thu';

      thuPhiList.push({
        _id: new Types.ObjectId(),
        maPhieuThu: maPhieuNVH,
        hoKhauId: hk._id,
        tenChuHo,
        diaChi: diaChiStr,
        soNhanKhau,
        chiTietThu: chiTietNVH,
        tongTien: tongNVH,
        ngayThu: new Date(2026, 1, faker.number.int({ min: 1, max: 15 })),
        nguoiThu: keToanUser,
        ghiChu: 'Đợt vận động cải tạo cơ sở vật chất',
        trangThai: trangThaiNVH,
        nam: 2026,
        kyThu: 'Đợt 1 - 2026',
      });
    }
  }

  await ThuPhiModel.insertMany(thuPhiList);
  console.log(`✓ Đã tạo ${thuPhiList.length} Phiếu Thu`);

  // ================= TỔNG KẾT =================
  console.log('\n========================================');
  console.log('🎉 SEED DỮ LIỆU HOÀN TẤT THÀNH CÔNG!');
  console.log('========================================');
  console.log(`• Users:           ${usersToInsert.length}`);
  console.log(`• Khoản Thu:       ${khoanThuToInsert.length}`);
  console.log(`• Hộ Khẩu:         ${hoKhauList.length}`);
  console.log(`• Nhân Khẩu:       ${nhanKhauList.length}`);
  console.log(`• Tạm Trú/Vắng:    ${tamTruTamVangList.length}`);
  console.log(`• Phiếu Thu:       ${thuPhiList.length}`);
  console.log('========================================\n');
}

seedAll()
  .catch((err: unknown) => {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ Lỗi khi seed dữ liệu:', errorMsg);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB.');
  });
