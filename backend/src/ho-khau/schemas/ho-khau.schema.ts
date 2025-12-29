import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DiaChi } from '../dto/create-ho-khau.dto';

export type HoKhauDocument = HoKhau & Document;

export class LichSuThayDoiHoKhau {
  noiDung: string;
  ngayThayDoi: Date;
  nguoiThucHien: string;
}

@Schema({ timestamps: true })
export class HoKhau {
  // Chủ hộ - tham chiếu đến NhanKhau
  @Prop({ type: Types.ObjectId, ref: 'NhanKhau', required: true })
  chuHoId: Types.ObjectId;

  @Prop({
    type: DiaChi,
    required: true,
  })
  diaChi: DiaChi;

  // Thành viên được lấy từ NhanKhau.find({ hoKhauId }) - không lưu trực tiếp trong schema nữa

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
