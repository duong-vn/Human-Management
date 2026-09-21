import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cấu hình đọc env từ các nguồn
dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const UserSchema = new mongoose.Schema(
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
    soDienThoai: String,
  },
  { timestamps: true },
);

const UserModel = mongoose.model('User', UserSchema);

const DEFAULT_USERS = [
  {
    hoTen: 'Nguyễn Văn A (Tổ trưởng)',
    username: 'admin',
    email: 'admin@gmail.com',
    passwordRaw: '123123',
    role: 'to_truong',
    soDienThoai: '0901234567',
  },
  {
    hoTen: 'Trần Thị C (Kế toán)',
    username: 'ketoan1',
    email: 'ketoan1@gmail.com',
    passwordRaw: '123123',
    role: 'ke_toan',
    soDienThoai: '0902345678',
  },
  {
    hoTen: 'Nguyễn Văn B (Cán bộ)',
    username: 'nhanvien1',
    email: 'nhanvien1@gmail.com',
    passwordRaw: '123123',
    role: 'can_bo',
    soDienThoai: '0903456789',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Lỗi: Chưa tìm thấy MONGODB_URI trong file cấu hình môi trường (.env / .env.development)');
    process.exit(1);
  }

  console.log('Đang kết nối MongoDB để seed users...');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('Kết nối MongoDB thành công!');

    for (const u of DEFAULT_USERS) {
      const hashedPassword = await bcrypt.hash(u.passwordRaw, 10);
      const existing = await UserModel.findOne({
        $or: [{ username: u.username }, { email: u.email }],
      });

      if (!existing) {
        await UserModel.create({
          hoTen: u.hoTen,
          username: u.username,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          soDienThoai: u.soDienThoai,
          isActive: true,
        });
        console.log(`✓ Đã tạo mới: ${u.username} (${u.email}) | Role: ${u.role} | Mật khẩu: ${u.passwordRaw}`);
      } else {
        existing.password = hashedPassword;
        existing.email = u.email;
        existing.hoTen = u.hoTen;
        existing.role = u.role as any;
        existing.isActive = true;
        await existing.save();
        console.log(`✓ Đã cập nhật: ${u.username} (${u.email}) | Role: ${u.role} | Mật khẩu: ${u.passwordRaw}`);
      }
    }
    console.log('\nSeed users hoàn tất thành công!');
  } catch (err) {
    console.error('Lỗi khi seed tài khoản:', (err as Error).message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
