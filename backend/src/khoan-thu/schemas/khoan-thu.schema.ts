import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KhoanThuDocument = KhoanThu & Document;

@Schema({ timestamps: true })
export class KhoanThu {
  @Prop({ required: true })
  tenKhoanThu: string;

  @Prop({
    type: String,
    enum: ['Bắt buộc', 'Tự nguyện'],
    required: true,
  })
  loaiKhoanThu: string; // Bắt buộc hoặc Tự nguyện

  @Prop()
  moTa: string;

  @Prop()
  soTien: number; // Số tiền cố định (nếu là bắt buộc)

  @Prop()
  donViTinh: string; // VD: "VNĐ/tháng/nhân khẩu"

  @Prop({ required: true })
  ngayBatDau: Date;

  @Prop()
  ngayKetThuc: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  ghiChu: string;

  // Dành cho các đợt thu đóng góp
  @Prop()
  tenDotThu: string; // VD: "Ủng hộ ngày thương binh-liệt sỹ 27/07"
}

export const KhoanThuSchema = SchemaFactory.createForClass(KhoanThu);
