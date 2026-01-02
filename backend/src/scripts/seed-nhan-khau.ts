// backend/src/scripts/seed-nhan-khau.ts

import mongoose from 'mongoose';
import { fakerVI as faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 1. Cấu hình đọc file .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 2. Định nghĩa Schema (Rút gọn)
const NhanKhauSchema = new mongoose.Schema({
  hoTen: String,
  biDanh: String,
  ngaySinh: Date,
  noiSinh: String,
  queQuan: String,
  danToc: String,
  ngheNghiep: String,
  noiLamViec: String,
  soDinhDanh: {
    so: String,
    ngayCap: Date,
    noiCap: String
  },
  gioiTinh: String,
  tonGiao: String,
  quocTich: String,
  diaChiThuongTru: {
    soNha: String,
    duong: String,
    phuongXa: String,
    quanHuyen: String,
    tinhThanh: String
  },
  diaChiHienTai: {
    soNha: String,
    duong: String,
    phuongXa: String,
    quanHuyen: String,
    tinhThanh: String
  },
  trangThai: String,
  hoKhauId: mongoose.Schema.Types.ObjectId,
  ghiChu: String,
  moiSinh: Boolean,
  quanHeVoiChuHo: String
}, { timestamps: true });

const NhanKhauModel = mongoose.model('NhanKhau', NhanKhauSchema);

async function seedData() {
const mongoURI = 'mongodb+srv://duong:nMTrMmZH62uTnBiI@mongo.oa5g0bb.mongodb.net/HumanManagement';

  console.log('⏳ Đang kết nối tới MongoDB...');

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Kết nối thành công!');

    const SO_LUONG = 50;
    // 🟢 SỬA LỖI: Thêm type any[] để TypeScript không báo lỗi gạch đỏ
    const danhSachNhanKhau: any[] = [];

    console.log(`⏳ Đang tạo ${SO_LUONG} nhân khẩu giả lập...`);

    for (let i = 0; i < SO_LUONG; i++) {
      const sexType = faker.person.sexType();
      const gender = sexType === 'male' ? 'Nam' : 'Nữ';
      const hoTen = faker.person.fullName({ sex: sexType });

      // Random trạng thái
      const randomPercent = Math.random();
      let trangThai = 'Thường trú';
      if (randomPercent > 0.7) trangThai = 'Tạm trú';
      if (randomPercent > 0.85) trangThai = 'Tạm vắng';
      if (randomPercent > 0.95) trangThai = 'Đã qua đời';

      // 🟢 SỬA LỖI: Thay ward() bằng street() hoặc một chuỗi giả
      const fakeAddress = {
        soNha: faker.location.buildingNumber(),
        duong: faker.location.street(),
        phuongXa: 'Phường ' + faker.location.street(), // Giả lập tên phường
        quanHuyen: faker.location.city(),
        tinhThanh: 'Hà Nội'
      };

      danhSachNhanKhau.push({
        hoTen: hoTen,
        biDanh: '',
        ngaySinh: faker.date.birthdate({ min: 0, max: 90, mode: 'age' }),
        noiSinh: 'Hà Nội',
        queQuan: faker.location.city(),
        danToc: 'Kinh',
        ngheNghiep: faker.person.jobTitle(),
        noiLamViec: faker.company.name(),
        soDinhDanh: {
          so: faker.string.numeric(12),
          ngayCap: faker.date.past({ years: 5 }),
          noiCap: 'Cục CSQLHC về TTXH'
        },
        gioiTinh: gender,
        tonGiao: 'Không',
        quocTich: 'Việt Nam',
        diaChiThuongTru: fakeAddress,
        diaChiHienTai: fakeAddress,
        trangThai: trangThai,
        ghiChu: trangThai === 'Đã qua đời' ? '[Qua đời] Dữ liệu mẫu seed' : '',
        moiSinh: false,
        quanHeVoiChuHo: 'Thành viên'
      });
    }

    // Insert
    await NhanKhauModel.insertMany(danhSachNhanKhau);
    console.log(`🎉 Đã thêm thành công ${SO_LUONG} nhân khẩu!`);

  } catch (error) {
    console.error('❌ Có lỗi xảy ra:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối.');
  }
}

seedData();
