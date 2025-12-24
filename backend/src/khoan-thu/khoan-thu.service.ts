import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateKhoanThuDto } from './dto/create-khoan-thu.dto';
import { UpdateKhoanThuDto } from './dto/update-khoan-thu.dto';
import { KhoanThu, KhoanThuDocument } from './schemas/khoan-thu.schema';

@Injectable()
export class KhoanThuService {
  constructor(
    @InjectModel(KhoanThu.name) private khoanThuModel: Model<KhoanThuDocument>,
  ) {}

  async create(createKhoanThuDto: CreateKhoanThuDto): Promise<KhoanThu> {
    const created = new this.khoanThuModel(createKhoanThuDto);
    return created.save();
  }

  async findAll(query?: {
    loaiKhoanThu?: string;
    isActive?: boolean;
  }): Promise<KhoanThu[]> {
    const filter: any = {};

    if (query?.loaiKhoanThu) {
      filter.loaiKhoanThu = query.loaiKhoanThu;
    }
    if (query?.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    return this.khoanThuModel.find(filter).exec();
  }

  async findOne(id: string): Promise<KhoanThu> {
    const khoanThu = await this.khoanThuModel.findById(id).exec();
    if (!khoanThu) {
      throw new NotFoundException('Không tìm thấy khoản thu');
    }
    return khoanThu;
  }

  async update(
    id: string,
    updateKhoanThuDto: UpdateKhoanThuDto,
  ): Promise<KhoanThu> {
    const updated = await this.khoanThuModel
      .findByIdAndUpdate(id, updateKhoanThuDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Không tìm thấy khoản thu');
    }
    return updated;
  }

  async remove(id: string): Promise<KhoanThu> {
    const deleted = await this.khoanThuModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy khoản thu');
    }
    return deleted;
  }

  // Lấy các khoản thu đang hoạt động
  async findActive(): Promise<KhoanThu[]> {
    return this.khoanThuModel.find({ isActive: true }).exec();
  }

  // Lấy khoản thu bắt buộc (phí vệ sinh)
  async findBatBuoc(): Promise<KhoanThu[]> {
    return this.khoanThuModel
      .find({
        loaiKhoanThu: 'Bắt buộc',
        isActive: true,
      })
      .exec();
  }

  // Lấy các đợt đóng góp tự nguyện
  async findTuNguyen(): Promise<KhoanThu[]> {
    return this.khoanThuModel
      .find({
        loaiKhoanThu: 'Tự nguyện',
        isActive: true,
      })
      .exec();
  }
}
