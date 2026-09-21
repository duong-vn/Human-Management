import assert from 'node:assert';
import fs from 'node:fs';

console.log('Running Performance & Strictness verification...');

// 1. Check Mongoose Schema Indexes
const nhanKhauSchema = fs.readFileSync('backend/src/nhan-khau/schemas/nhan-khau.schema.ts', 'utf8');
assert(nhanKhauSchema.includes('.index({ \'soDinhDanh.so\': 1 }'), 'NhanKhau must index soDinhDanh.so');
assert(nhanKhauSchema.includes('.index({ hoKhauId: 1 }'), 'NhanKhau must index hoKhauId');
assert(nhanKhauSchema.includes('.index({ trangThai: 1 }'), 'NhanKhau must index trangThai');

const hoKhauSchema = fs.readFileSync('backend/src/ho-khau/schemas/ho-khau.schema.ts', 'utf8');
assert(hoKhauSchema.includes('.index({ chuHo: 1 }'), 'HoKhau must index chuHo');
assert(hoKhauSchema.includes('.index({ trangThai: 1 }'), 'HoKhau must index trangThai');
assert(hoKhauSchema.includes(".index({ 'thanhVien.nhanKhauId': 1 }"), 'HoKhau must index thanhVien.nhanKhauId');

const thuPhiSchema = fs.readFileSync('backend/src/thu-phi/schemas/thu-phi.schema.ts', 'utf8');
assert(thuPhiSchema.includes('.index({ hoKhauId: 1 }'), 'ThuPhi must index hoKhauId');
assert(thuPhiSchema.includes('.index({ nam: 1, trangThai: 1 }'), 'ThuPhi must index nam and trangThai');

const tamTruSchema = fs.readFileSync('backend/src/tam-tru-tam-vang/schemas/tam-tru-tam-vang.schema.ts', 'utf8');
assert(tamTruSchema.includes('.index({ nhanKhauId: 1 }'), 'TamTruTamVang must index nhanKhauId');

const khoanThuSchema = fs.readFileSync('backend/src/khoan-thu/schemas/khoan-thu.schema.ts', 'utf8');
assert(khoanThuSchema.includes('.index({ loaiKhoanThu: 1, isActive: 1 }'), 'KhoanThu must index loaiKhoanThu and isActive');

// 2. Check .lean() and FilterQuery usage in services
const nhanKhauService = fs.readFileSync('backend/src/nhan-khau/nhan-khau.service.ts', 'utf8');
assert(nhanKhauService.includes('.lean()'), 'NhanKhauService must use .lean()');
assert(nhanKhauService.includes('FilterQuery<NhanKhauDocument>'), 'NhanKhauService must use FilterQuery');

const hoKhauService = fs.readFileSync('backend/src/ho-khau/ho-khau.service.ts', 'utf8');
assert(hoKhauService.includes('.lean()'), 'HoKhauService must use .lean()');
assert(hoKhauService.includes('FilterQuery<HoKhauDocument>'), 'HoKhauService must use FilterQuery');
assert(!hoKhauService.includes('console.log(hoKhau)'), 'HoKhauService must not contain debug console.log');

const thuPhiService = fs.readFileSync('backend/src/thu-phi/thu-phi.service.ts', 'utf8');
assert(thuPhiService.includes('.lean()'), 'ThuPhiService must use .lean()');
assert(thuPhiService.includes('FilterQuery<ThuPhiDocument>'), 'ThuPhiService must use FilterQuery');

// 3. Check Auth typing
const authService = fs.readFileSync('backend/src/auth/auth.service.ts', 'utf8');
assert(!authService.includes('refrest_token'), 'Typo refrest_token must be fixed');
assert(authService.includes('refreshToken'), 'refreshToken must be used');
assert(authService.includes('JwtPayload'), 'AuthService must use JwtPayload');

// 4. Check Frontend Providers.tsx
const providers = fs.readFileSync('frontend/src/app/Providers.tsx', 'utf8');
assert(!providers.includes('<html'), 'Providers.tsx must not contain nested <html>');
assert(!providers.includes('<body'), 'Providers.tsx must not contain nested <body>');
assert(providers.includes('staleTime:'), 'Providers.tsx must configure staleTime');

// 5. Check globals.css
const globalsCss = fs.readFileSync('frontend/src/app/globals.css', 'utf8');
assert(!globalsCss.includes('* {\n  transition-property:'), 'globals.css must not use wildcard transition on *');

console.log('All performance and strictness assertions passed successfully!');
