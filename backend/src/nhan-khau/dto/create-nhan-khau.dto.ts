import {
  IsNotEmpty,
  IsString,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsMongoId,
  Length,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class DiaChiDto {
  @IsNotEmpty({ message: 'Số nhà không được để trống' })
  @IsString()
  soNha: string;

  @IsNotEmpty({ message: 'Đường không được để trống' })
  @IsString()
  duong: string;

  @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
  @IsString()
  phuongXa: string;

  @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
  @IsString()
  quanHuyen: string;

  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  @IsString()
  tinhThanh: string;
}

export class CreateNhanKhauDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  hoTen: string;

  @IsNotEmpty({ message: 'Số CCCD không được để trống' })
  @IsString()
  @Length(12, 12, { message: 'Số CCCD phải có đúng 12 chữ số' })
  cccd: string;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsDateString({}, { message: 'Ngày sinh phải là định dạng ngày hợp lệ' })
  ngaySinh: Date;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsString()
  @IsIn(['Nam', 'Nữ', 'Khác'], {
    message: 'Giới tính phải là Nam, Nữ hoặc Khác',
  })
  gioiTinh: string;

  @IsNotEmpty({ message: 'Nơi sinh không được để trống' })
  @IsString()
  noiSinh: string;

  @IsNotEmpty({ message: 'Quê quán không được để trống' })
  @IsString()
  queQuan: string;

  @IsNotEmpty({ message: 'Dân tộc không được để trống' })
  @IsString()
  danToc: string;

  @IsOptional()
  @IsString()
  tonGiao?: string;

  @IsOptional()
  @IsString()
  quocTich?: string;

  @IsOptional()
  @IsString()
  ngheNghiep?: string;

  @IsOptional()
  @IsString()
  noiLamViec?: string;

  @IsNotEmpty({ message: 'Địa chỉ hiện tại không được để trống' })
  @ValidateNested()
  @Type(() => DiaChiDto)
  diaChiHienTai: DiaChiDto;

  @IsNotEmpty({ message: 'Địa chỉ thường trú không được để trống' })
  @ValidateNested()
  @Type(() => DiaChiDto)
  diaChiThuongTru: DiaChiDto;

  @IsOptional()
  @IsMongoId({ message: 'hoKhauId phải là MongoDB ObjectId hợp lệ' })
  hoKhauId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Thường trú', 'Tạm trú', 'Tạm vắng', 'Đã chuyển đi'], {
    message:
      'Trạng thái phải là: Thường trú, Tạm trú, Tạm vắng, hoặc Đã chuyển đi',
  })
  trangThai?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày đăng ký thường trú phải là định dạng ngày hợp lệ' },
  )
  ngayDangKyThuongTru?: Date;

  @IsOptional()
  @IsString()
  ghiChu?: string;
}
