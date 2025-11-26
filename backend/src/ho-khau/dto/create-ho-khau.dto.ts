import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChuHoDto {
  @IsOptional()
  @IsMongoId({ message: 'nhanKhauId must be a valid MongoDB ObjectId' })
  nhanKhauId?: string;

  @IsNotEmpty({ message: 'Họ tên chủ hộ không được để trống' })
  @IsString()
  hoTen: string;
}

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

class ThanhVienDto {
  @IsMongoId({ message: 'nhanKhauId must be a valid MongoDB ObjectId' })
  nhanKhauId: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  hoTen: string;
  @IsNotEmpty({ message: 'Quan hệ với chủ hộ không được để trống' })
  @IsString()
  quanHeVoiChuHo: string;
}

export class CreateHoKhauDto {
  @IsNotEmpty({ message: 'Mã hộ khẩu không được để trống' })
  @IsString()
  maHoKhau: string;

  @IsNotEmpty({ message: 'Thông tin chủ hộ không được để trống' })
  @ValidateNested()
  @Type(() => ChuHoDto)
  chuHo: ChuHoDto;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested()
  @Type(() => DiaChiDto)
  diaChi: DiaChiDto;

  @IsOptional()
  @IsString()
  trangThai?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThanhVienDto)
  thanhVien?: ThanhVienDto[];
}
