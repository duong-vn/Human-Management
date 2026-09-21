import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsMongoId,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiaChi } from 'src/ho-khau/dto/create-ho-khau.dto';

export class CreateTamTruTamVangDto {
  @ApiProperty({ description: 'ID nhân khẩu' })
  @IsOptional()
  @IsMongoId({ message: 'Nhân khẩu ID không hợp lệ' })
  nhanKhauId?: string;

  @ApiProperty({ description: 'Họ tên người đăng ký' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  hoTen: string;

  @ApiProperty({ description: 'Loại đăng ký', enum: ['Tạm trú', 'Tạm vắng'] })
  @IsNotEmpty({ message: 'Loại không được để trống' })
  @IsIn(['Tạm trú', 'Tạm vắng'], {
    message: 'Loại phải là Tạm trú hoặc Tạm vắng',
  })
  loai: string;

  @ApiProperty({ description: 'Ngày bắt đầu' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString()
  tuNgay: Date;

  @ApiProperty({ description: 'Ngày kết thúc' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString()
  denNgay: Date;

  @ApiPropertyOptional({
    description: 'Địa chỉ tạm trú (nếu là tạm trú)',
    example: {
      soNha: '123',
      duong: 'Lê Lợi',
      phuongXa: 'Phường Bến Nghé',
      quanHuyen: 'Quận 1',
      tinhThanh: 'TP.HCM',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiaChi)
  diaChiTamTru?: DiaChi;

  @ApiPropertyOptional({
    description: 'Địa chỉ thường trú gốc',
    example: {
      soNha: '456',
      duong: 'Trần Hưng Đạo',
      phuongXa: 'Phường 1',
      quanHuyen: 'Quận 5',
      tinhThanh: 'TP.HCM',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiaChi)
  diaChiThuongTru?: DiaChi;

  @ApiPropertyOptional({ description: 'Lý do tạm trú/tạm vắng' })
  @IsOptional()
  @IsString()
  lyDo?: string;

  @ApiPropertyOptional({ description: 'Nơi đến (nếu là tạm vắng)' })
  @IsOptional()
  @IsString()
  noiDen?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}
