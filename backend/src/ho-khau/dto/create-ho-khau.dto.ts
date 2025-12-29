import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DiaChi {
  @IsOptional()
  @IsString()
  soNha?: string;

  @IsOptional()
  @IsString()
  duong?: string;

  @IsOptional()
  @IsString()
  phuongXa?: string;

  @IsOptional()
  @IsString()
  quanHuyen?: string;

  @IsOptional()
  @IsString()
  tinhThanh?: string;
}

export class CreateHoKhauDto {
  @IsNotEmpty({ message: 'Chủ hộ không được để trống' })
  @IsMongoId({ message: 'chuHoId phải là MongoDB ObjectId hợp lệ' })
  chuHoId: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested()
  @Type(() => DiaChi)
  diaChi: DiaChi;

  @IsOptional()
  @IsString()
  trangThai?: string;

  @IsOptional()
  ghiChu?: string;

  // Danh sách thành viên kèm quan hệ với chủ hộ (dùng khi tạo hộ khẩu)
  @IsOptional()
  thanhVien?: {
    nhanKhauId: string;
    quanHeVoiChuHo: string;
  }[];
}
