import { PartialType } from '@nestjs/mapped-types';
import { CreateTamTruTamVangDto } from './create-tam-tru-tam-vang.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateTamTruTamVangDto extends PartialType(
  CreateTamTruTamVangDto,
) {
  @IsOptional()
  @IsIn(['Đang hiệu lực', 'Hết hạn', 'Đã hủy'], {
    message: 'Trạng thái phải là: Đang hiệu lực, Hết hạn, hoặc Đã hủy',
  })
  trangThai?: string;
}
