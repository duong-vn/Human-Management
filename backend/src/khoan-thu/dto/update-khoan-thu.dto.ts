import { PartialType } from '@nestjs/swagger';
import { CreateKhoanThuDto } from './create-khoan-thu.dto';

export class UpdateKhoanThuDto extends PartialType(CreateKhoanThuDto) {}
