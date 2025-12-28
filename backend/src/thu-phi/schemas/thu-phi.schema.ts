import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ThuPhiDocument = ThuPhi & Document;

export class ChiTietThu {
  khoanThuId: Types.ObjectId;
  tenKhoanThu: string;
  soTien: number;
  ghiChu?: string;
}

@Schema({ timestamps: true })
export class ThuPhi {
  @Prop({ required: true, unique: true })
  maPhieuThu: string;

  @Prop({ type: Types.ObjectId, ref: 'HoKhau', required: true })
  hoKhauId: Types.ObjectId;

  @Prop({ required: true })
  tenChuHo: string;

  @Prop({ required: true })
  diaChi: string;

  @Prop({ required: true })
  soNhanKhau: number;

  @Prop({ type: [ChiTietThu], default: [] })
  chiTietThu: ChiTietThu[];

  @Prop({ required: true })
  tongTien: number;

  @Prop({ required: true })
  ngayThu: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  nguoiThu: Types.ObjectId;

  @Prop()
  ghiChu: string;

  @Prop({
    type: String,
    enum: ['Đã thu', 'Chưa thu', 'Đang nợ'],
    default: 'Chưa thu',
  })
  trangThai: string;

  // Năm thu phí
  @Prop({ required: true })
  nam: number;

  // Kỳ thu (tháng hoặc đợt)
  @Prop()
  kyThu: string;
}

export const ThuPhiSchema = SchemaFactory.createForClass(ThuPhi);
