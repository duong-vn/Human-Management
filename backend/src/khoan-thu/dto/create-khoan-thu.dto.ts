import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateKhoanThuDto {
  @ApiProperty({ description: 'Tên khoản thu', example: 'Phí vệ sinh' })
  @IsNotEmpty({ message: 'Tên khoản thu không được để trống' })
  @IsString()
  tenKhoanThu: string;

  @ApiProperty({
    description: 'Loại khoản thu',
    enum: ['Bắt buộc', 'Tự nguyện'],
    example: 'Bắt buộc',
  })
  @IsNotEmpty({ message: 'Loại khoản thu không được để trống' })
  @IsString()
  @IsIn(['Bắt buộc', 'Tự nguyện'], {
    message: 'Loại khoản thu phải là Bắt buộc hoặc Tự nguyện',
  })
  loaiKhoanThu: string;

  @ApiPropertyOptional({ description: 'Mô tả khoản thu' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiPropertyOptional({
    description: 'Số tiền (nếu là khoản bắt buộc)',
    example: 6000,
  })
  @IsOptional()
  @IsNumber()
  soTien?: number;

  @ApiPropertyOptional({
    description: 'Đơn vị tính',
    example: 'VNĐ/tháng/nhân khẩu',
  })
  @IsOptional()
  @IsString()
  donViTinh?: string;

  @ApiProperty({ description: 'Ngày bắt đầu thu' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString()
  ngayBatDau: Date;

  @ApiPropertyOptional({ description: 'Ngày kết thúc thu' })
  @IsOptional()
  @IsDateString()
  ngayKetThuc?: Date;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;

  @ApiPropertyOptional({
    description: 'Tên đợt thu (cho các đợt đóng góp)',
    example: 'Ủng hộ ngày thương binh-liệt sỹ 27/07',
  })
  @IsOptional()
  @IsString()
  tenDotThu?: string;
}
