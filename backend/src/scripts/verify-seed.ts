import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function verify() {
  const uri = process.env.MONGODB_URI;
  assert.ok(uri, 'MONGODB_URI must be provided');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  assert.ok(db, 'Database connection must be established');

  const usersCount = await db.collection('users').countDocuments();
  assert.strictEqual(usersCount, 4, 'Users count must equal 4');

  const khoanThuCount = await db.collection('khoanthus').countDocuments();
  assert.ok(khoanThuCount >= 6, 'KhoanThu count must be >= 6');

  const hoKhauCount = await db.collection('hokhaus').countDocuments();
  assert.strictEqual(hoKhauCount, 16, 'HoKhau count must be 16');

  const nhanKhauCount = await db.collection('nhankhaus').countDocuments();
  assert.ok(nhanKhauCount >= 60, 'NhanKhau count must be >= 60');

  const tamTruTamVangCount = await db.collection('tamtru_tamvangs').countDocuments() || await db.collection('tamtRutamvangs').countDocuments() || await db.collection('tamtRutamvangs').countDocuments();
  // check collection name for TamTruTamVang
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);

  // Check ThuPhi data integrity
  const thuPhiColName = collectionNames.find((n) => n.toLowerCase().includes('thuphi')) || 'thuphis';
  const thuPhiList = await db.collection(thuPhiColName).find({}).toArray();
  assert.ok(thuPhiList.length > 0, 'Must have thu phi records');

  for (const tp of thuPhiList) {
    const calculatedSum = tp.chiTietThu.reduce((acc: number, item: { soTien: number }) => acc + item.soTien, 0);
    assert.strictEqual(tp.tongTien, calculatedSum, `TongTien on ${tp.maPhieuThu} must match chiTietThu sum`);
    assert.ok(tp.hoKhauId, `hoKhauId on ${tp.maPhieuThu} must be present`);
  }

  // Check HoKhau integrity
  const hoKhauColName = collectionNames.find((n) => n.toLowerCase().includes('hokhau')) || 'hokhaus';
  const hoKhauList = await db.collection(hoKhauColName).find({}).toArray();
  for (const hk of hoKhauList) {
    assert.ok(hk.chuHo, `HoKhau ${hk._id} must have a chuHo`);
    assert.ok(Array.isArray(hk.thanhVien) && hk.thanhVien.length > 0, `HoKhau ${hk._id} must have members`);
  }

  console.log('✅ Dữ liệu seed hoàn toàn hợp lệ và toàn vẹn!');
  await mongoose.disconnect();
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
