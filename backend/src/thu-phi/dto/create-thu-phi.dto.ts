import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChiTietThuDto {
  @ApiProperty({ description: 'ID khoản thu' })
  @IsMongoId()
  khoanThuId: string;

  @ApiProperty({ description: 'Tên khoản thu' })
  @IsString()
  tenKhoanThu: string;

  @ApiProperty({ description: 'Số tiền', example: 72000 })
  @IsNumber()
  soTien: number;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class CreateThuPhiDto {
  @ApiProperty({ description: 'Mã phiếu thu', example: 'PT-2024-001' })
  @IsNotEmpty({ message: 'Mã phiếu thu không được để trống' })
  @IsString()
  maPhieuThu: string;

  @ApiProperty({ description: 'ID hộ khẩu' })
  @IsNotEmpty({ message: 'ID hộ khẩu không được để trống' })
  @IsMongoId()
  hoKhauId: string;

  @ApiProperty({ description: 'Tên chủ hộ' })
  @IsNotEmpty({ message: 'Tên chủ hộ không được để trống' })
  @IsString()
  tenChuHo: string;

  @ApiProperty({ description: 'Địa chỉ' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString()
  diaChi: string;

  @ApiProperty({ description: 'Số nhân khẩu', example: 4 })
  @IsNumber()
  soNhanKhau: number;

  @ApiProperty({ description: 'Chi tiết các khoản thu', type: [ChiTietThuDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChiTietThuDto)
  chiTietThu: ChiTietThuDto[];

  @ApiProperty({ description: 'Tổng tiền', example: 72000 })
  @IsNumber()
  tongTien: number;

  @ApiProperty({ description: 'Ngày thu' })
  @IsDateString()
  ngayThu: Date;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái',
    enum: ['Đã thu', 'Chưa thu', 'Đang nợ'],
    default: 'Đã thu',
  })
  @IsOptional()
  @IsString()
  @IsIn(['Đã thu', 'Chưa thu', 'Đang nợ'])
  trangThai?: string;

  @ApiProperty({ description: 'Năm thu phí', example: 2024 })
  @IsNumber()
  nam: number;

  @ApiPropertyOptional({ description: 'Kỳ thu', example: 'Năm 2024' })
  @IsOptional()
  @IsString()
  kyThu?: string;
}
