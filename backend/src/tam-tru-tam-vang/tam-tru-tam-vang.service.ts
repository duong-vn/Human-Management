import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTamTruTamVangDto } from './dto/create-tam-tru-tam-vang.dto';
import { UpdateTamTruTamVangDto } from './dto/update-tam-tru-tam-vang.dto';
import {
  TamTruTamVang,
  TamTruTamVangDocument,
} from './schemas/tam-tru-tam-vang.schema';
import {
  NhanKhau,
  NhanKhauDocument,
} from 'src/nhan-khau/schemas/nhan-khau.schema';

@Injectable()
export class TamTruTamVangService {
  constructor(
    @InjectModel(TamTruTamVang.name)
    private tamTruTamVangModel: Model<TamTruTamVangDocument>,
    @InjectModel(NhanKhau.name)
    private nhanKhauModel: Model<NhanKhauDocument>,
  ) {}

  async create(
    createDto: CreateTamTruTamVangDto,
    nguoiDuyetId?: string,
  ): Promise<TamTruTamVang> {
    if (createDto.nhanKhauId !== undefined) {
      const checkNhanKhau = await this.nhanKhauModel.findById(
        createDto.nhanKhauId,
      );
      if (!checkNhanKhau) {
        throw new BadRequestException('Không tồn tại nhân khẩu');
      }
    }

    const created = new this.tamTruTamVangModel({
      ...createDto,
      nguoiDuyet: nguoiDuyetId,
      ngayDuyet: new Date(),
    });

    const saved = await created.save();

    // Cập nhật trạng thái nhân khẩu nếu có nhanKhauId
    if (createDto.nhanKhauId) {
      const newTrangThai = createDto.loai === 'Tạm trú' ? 'Tạm trú' : 'Tạm vắng';
      await this.nhanKhauModel.findByIdAndUpdate(
        createDto.nhanKhauId,
        { trangThai: newTrangThai },
        { new: true }
      );
    }

    return saved;
  }

  async findAll(query?: {
    loai?: string;
    trangThai?: string;
    tuNgay?: Date;
    denNgay?: Date;
  }): Promise<TamTruTamVang[]> {
    const filter: any = {};

    if (query?.loai) {
      filter.loai = query.loai;
    }
    if (query?.trangThai) {
      filter.trangThai = query.trangThai;
    }
    if (query?.tuNgay && query?.denNgay) {
      filter.tuNgay = { $gte: query.tuNgay };
      filter.denNgay = { $lte: query.denNgay };
    }

    return this.tamTruTamVangModel
      .find(filter)
      .populate('nhanKhauId')
      .populate('nguoiDuyet', 'hoTen username')
      .exec();
  }

  async findOne(id: string): Promise<TamTruTamVang | null> {
    return this.tamTruTamVangModel
      .findById(id)
      .populate('nhanKhauId')
      .populate('nguoiDuyet', 'hoTen username')
      .exec();
  }

  async findByNhanKhau(nhanKhauId: string): Promise<TamTruTamVang[]> {
    return this.tamTruTamVangModel
      .find({ nhanKhauId })
      .populate('nguoiDuyet', 'hoTen username')
      .exec();
  }

  async update(
    id: string,
    updateDto: UpdateTamTruTamVangDto,
  ): Promise<TamTruTamVang | null> {
    const existing = await this.tamTruTamVangModel.findById(id);
    if (!existing) return null;

    const updated = await this.tamTruTamVangModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('nhanKhauId')
      .exec();

    // Cập nhật trạng thái nhân khẩu nếu có thay đổi trạng thái
    if (updated && updateDto.trangThai && existing.nhanKhauId) {
      let newTrangThai = 'Thường trú';
      if (updateDto.trangThai === 'Đang hiệu lực') {
        newTrangThai = updated.loai === 'Tạm trú' ? 'Tạm trú' : 'Tạm vắng';
      }
      await this.nhanKhauModel.findByIdAndUpdate(
        existing.nhanKhauId,
        { trangThai: newTrangThai },
        { new: true }
      );
    }

    return updated;
  }

  async remove(id: string): Promise<TamTruTamVang | null> {
    const existing = await this.tamTruTamVangModel.findById(id);
    if (!existing) return null;

    const deleted = await this.tamTruTamVangModel.findByIdAndDelete(id).exec();

    // Reset trạng thái nhân khẩu về "Thường trú" nếu có nhanKhauId
    if (existing.nhanKhauId) {
      await this.nhanKhauModel.findByIdAndUpdate(
        existing.nhanKhauId,
        { trangThai: 'Thường trú' },
        { new: true }
      );
    }

    return deleted;
  }

  // Thống kê tạm trú/tạm vắng
  async thongKe(tuNgay?: Date, denNgay?: Date): Promise<any> {
    const filter: any = { trangThai: 'Đang hiệu lực' };

    if (tuNgay && denNgay) {
      filter.tuNgay = { $gte: tuNgay };
      filter.denNgay = { $lte: denNgay };
    }

    const [tamTru, tamVang] = await Promise.all([
      this.tamTruTamVangModel.countDocuments({ ...filter, loai: 'Tạm trú' }),
      this.tamTruTamVangModel.countDocuments({ ...filter, loai: 'Tạm vắng' }),
    ]);

    return {
      tamTru,
      tamVang,
      tongCong: tamTru + tamVang,
    };
  }

  // Cập nhật trạng thái hết hạn
  async updateExpiredStatus(): Promise<void> {
    const now = new Date();
    await this.tamTruTamVangModel.updateMany(
      { denNgay: { $lt: now }, trangThai: 'Đang hiệu lực' },
      { $set: { trangThai: 'Hết hạn' } },
    );
  }
}
