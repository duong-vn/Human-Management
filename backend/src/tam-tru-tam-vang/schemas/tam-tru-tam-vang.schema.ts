import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DiaChi } from 'src/ho-khau/dto/create-ho-khau.dto';

export type TamTruTamVangDocument = TamTruTamVang & Document;

@Schema({ timestamps: true })
export class TamTruTamVang {
  @Prop({ type: Types.ObjectId, ref: 'NhanKhau' })
  nhanKhauId?: Types.ObjectId;

  @Prop({ required: true })
  hoTen: string;

  @Prop({ type: String, enum: ['Tạm trú', 'Tạm vắng'], required: true })
  loai: string;

  @Prop({ required: true })
  tuNgay: Date;

  @Prop({ required: true })
  denNgay: Date;

  @Prop({ type: DiaChi })
  diaChiTamTru: DiaChi; // Địa chỉ tạm trú (nếu là tạm trú)

  @Prop({ type: DiaChi })
  diaChiThuongTru: DiaChi; // Địa chỉ thường trú gốc

  @Prop()
  lyDo: string;

  @Prop()
  noiDen: string; // Nơi đến (nếu là tạm vắng)

  @Prop({
    type: String,
    enum: ['Đang hiệu lực', 'Hết hạn', 'Đã hủy'],
    default: 'Đang hiệu lực',
  })
  trangThai: string;

  @Prop()
  ghiChu: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  nguoiDuyet: Types.ObjectId;

  @Prop()
  ngayDuyet: Date;
}

export const TamTruTamVangSchema = SchemaFactory.createForClass(TamTruTamVang);
