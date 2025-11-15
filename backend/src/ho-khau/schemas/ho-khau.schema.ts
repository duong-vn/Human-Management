import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HoKhauDocument = HoKhau & Document;

@Schema({ timestamps: true })
export class HoKhau {
  @Prop({ required: true, unique: true })
  maHoKhau: string;

  @Prop({
    type: {
      nhanKhauId: { type: Types.ObjectId, ref: 'NhanKhau' },
      hoTen: { type: String, required: true },
    },
    required: true,
  })
  chuHo: {
    nhanKhauId: Types.ObjectId;
    hoTen: string;
  };

  @Prop({
    type: {
      soNha: String,
      duong: String,
      phuongXa: String,
      quanHuyen: String,
      tinhThanh: String,
    },
    required: true,
  })
  diaChi: {
    soNha: string;
    duong: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
  };

  @Prop({ required: true, type: Date })
  ngayLap: Date;

  @Prop({ required: true, default: 'Hoạt động' })
  trangThai: string;

  @Prop({
    type: [
      {
        nhanKhauId: { type: Types.ObjectId, ref: 'NhanKhau' },
        quanHeVoiChuHo: String,
      },
    ],
    default: [],
  })
  thanhVien: Array<{
    nhanKhauId: Types.ObjectId;
    quanHeVoiChuHo: string;
  }>;
}

export const HoKhauSchema = SchemaFactory.createForClass(HoKhau);
