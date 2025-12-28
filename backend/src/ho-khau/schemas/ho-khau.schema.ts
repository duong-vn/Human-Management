import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChuHoDto, DiaChi, ThanhVien } from '../dto/create-ho-khau.dto';

export type HoKhauDocument = HoKhau & Document;

export class LichSuThayDoiHoKhau {
  noiDung: string;
  ngayThayDoi: Date;
  nguoiThucHien: string;
}

@Schema({ timestamps: true })
export class HoKhau {
  @Prop({
    type: ChuHoDto,
  })
  chuHo: ChuHoDto;

  @Prop({
    type: DiaChi,
    required: true,
  })
  diaChi: DiaChi;

  @Prop({
    type: [ThanhVien],
    default: [],
  })
  thanhVien: ThanhVien[];

  @Prop({
    type: String,
    enum: ['Đang hoạt động', 'Đã tách hộ', 'Đã xóa'],
    default: 'Đang hoạt động',
  })
  trangThai: string;

  @Prop({ type: Date })
  ngayLap: Date;

  @Prop()
  ghiChu: string;

  // Lịch sử thay đổi hộ khẩu (thay đổi chủ hộ, tách hộ, ...)
  @Prop({ type: [LichSuThayDoiHoKhau], default: [] })
  lichSuThayDoi: LichSuThayDoiHoKhau[];
}

export const HoKhauSchema = SchemaFactory.createForClass(HoKhau);
