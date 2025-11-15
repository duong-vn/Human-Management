import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NhanKhauDocument = NhanKhau & Document;

@Schema({ timestamps: true })
export class NhanKhau {
  @Prop({ required: true })
  hoTen: string;

  @Prop({ required: true, unique: true })
  cccd: string;

  @Prop({ required: true, type: Date })
  ngaySinh: Date;

  @Prop({ required: true })
  gioiTinh: string;

  @Prop({ required: true })
  noiSinh: string;

  @Prop({ required: true })
  queQuan: string;

  @Prop({ required: true })
  danToc: string;

  @Prop({ default: 'Không' })
  tonGiao: string;

  @Prop({ required: true, default: 'Việt Nam' })
  quocTich: string;

  @Prop()
  ngheNghiep: string;

  @Prop()
  noiLamViec: string;

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
  diaChiHienTai: {
    soNha: string;
    duong: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
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
  diaChiThuongTru: {
    soNha: string;
    duong: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'HoKhau' })
  hoKhauId: Types.ObjectId;

  @Prop({ required: true, default: 'Thường trú' })
  trangThai: string;

  @Prop({ type: Date })
  ngayDangKyThuongTru: Date;

  @Prop()
  ghiChu: string;
}

export const NhanKhauSchema = SchemaFactory.createForClass(NhanKhau);
