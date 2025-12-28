import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateThuPhiDto } from './dto/create-thu-phi.dto';
import { UpdateThuPhiDto } from './dto/update-thu-phi.dto';
import { ThuPhi, ThuPhiDocument } from './schemas/thu-phi.schema';

@Injectable()
export class ThuPhiService {
  constructor(
    @InjectModel(ThuPhi.name) private thuPhiModel: Model<ThuPhiDocument>,
  ) {}

  async create(
    createThuPhiDto: CreateThuPhiDto,
    nguoiThuId?: string,
  ): Promise<ThuPhi> {
    const created = new this.thuPhiModel({
      ...createThuPhiDto,
      nguoiThu: nguoiThuId ? new Types.ObjectId(nguoiThuId) : undefined,
    });
    return created.save();
  }

  async findAll(query?: {
    hoKhauId?: string;
    nam?: number;
    trangThai?: string;
    khoanThuId?: string;
    kyThu?: string;
  }): Promise<ThuPhi[]> {
    const filter: any = {};

    if (query?.hoKhauId) {
      filter.hoKhauId = new Types.ObjectId(query.hoKhauId);
    }
    if (query?.nam) {
      filter.nam = query.nam;
    }
    if (query?.trangThai) {
      filter.trangThai = query.trangThai;
    }
    if (query?.khoanThuId) {
      filter['chiTietThu.khoanThuId'] = new Types.ObjectId(query.khoanThuId);
    }
    if (query?.kyThu) {
      filter.kyThu = query.kyThu;
    }

    return this.thuPhiModel
      .find(filter)
      .populate('hoKhauId')
      .populate('nguoiThu', 'hoTen username')
      .exec();
  }

  async findOne(id: string): Promise<ThuPhi> {
    const thuPhi = await this.thuPhiModel
      .findById(id)
      .populate('hoKhauId')
      .populate('nguoiThu', 'hoTen username')
      .exec();
    if (!thuPhi) {
      throw new NotFoundException('Không tìm thấy phiếu thu');
    }
    return thuPhi;
  }

  async findByHoKhau(hoKhauId: string): Promise<ThuPhi[]> {
    return this.thuPhiModel
      .find({ hoKhauId: new Types.ObjectId(hoKhauId) })
      .populate('nguoiThu', 'hoTen username')
      .exec();
  }

  async update(id: string, updateThuPhiDto: UpdateThuPhiDto): Promise<ThuPhi> {
    const updated = await this.thuPhiModel
      .findByIdAndUpdate(id, updateThuPhiDto, { new: true })
      .populate('hoKhauId')
      .populate('nguoiThu', 'hoTen username')
      .exec();
    if (!updated) {
      throw new NotFoundException('Không tìm thấy phiếu thu');
    }
    return updated;
  }

  async remove(id: string): Promise<ThuPhi> {
    const deleted = await this.thuPhiModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy phiếu thu');
    }
    return deleted;
  }

  // Thống kê thu phí theo đợt/khoản thu
  async thongKeTheoKhoanThu(khoanThuId: string, nam?: number): Promise<any> {
    const filter: any = {
      'chiTietThu.khoanThuId': new Types.ObjectId(khoanThuId),
      trangThai: 'Đã thu',
    };
    if (nam) {
      filter.nam = nam;
    }

    const result = await this.thuPhiModel.aggregate([
      { $match: filter },
      { $unwind: '$chiTietThu' },
      { $match: { 'chiTietThu.khoanThuId': new Types.ObjectId(khoanThuId) } },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$chiTietThu.soTien' },
          soHoDaNop: { $addToSet: '$hoKhauId' },
        },
      },
      {
        $project: {
          tongTien: 1,
          soHoDaNop: { $size: '$soHoDaNop' },
        },
      },
    ]);

    return result[0] || { tongTien: 0, soHoDaNop: 0 };
  }

  // Thống kê tổng thu trong năm
  async thongKeTheoNam(nam: number): Promise<any> {
    const result = await this.thuPhiModel.aggregate([
      { $match: { nam, trangThai: 'Đã thu' } },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$tongTien' },
          soPhieuThu: { $sum: 1 },
          soHoDaNop: { $addToSet: '$hoKhauId' },
        },
      },
      {
        $project: {
          tongTien: 1,
          soPhieuThu: 1,
          soHoDaNop: { $size: '$soHoDaNop' },
        },
      },
    ]);

    return result[0] || { tongTien: 0, soPhieuThu: 0, soHoDaNop: 0 };
  }

  // Thống kê chi tiết từng khoản thu trong năm
  async thongKeChiTietTheoNam(nam: number): Promise<any> {
    return this.thuPhiModel.aggregate([
      { $match: { nam, trangThai: 'Đã thu' } },
      { $unwind: '$chiTietThu' },
      {
        $group: {
          _id: {
            khoanThuId: '$chiTietThu.khoanThuId',
            tenKhoanThu: '$chiTietThu.tenKhoanThu',
          },
          tongTien: { $sum: '$chiTietThu.soTien' },
          soHoDaNop: { $addToSet: '$hoKhauId' },
        },
      },
      {
        $project: {
          khoanThuId: '$_id.khoanThuId',
          tenKhoanThu: '$_id.tenKhoanThu',
          tongTien: 1,
          soHoDaNop: { $size: '$soHoDaNop' },
        },
      },
    ]);
  }

  // Lấy danh sách hộ chưa nộp một khoản thu cụ thể
  async getDanhSachChuaNop(
    khoanThuId: string,
    nam: number,
    danhSachHoKhauIds: string[],
  ): Promise<string[]> {
    const daNop = await this.thuPhiModel.distinct('hoKhauId', {
      'chiTietThu.khoanThuId': new Types.ObjectId(khoanThuId),
      nam,
      trangThai: 'Đã thu',
    });

    const daNopIds = daNop.map((id) => id.toString());
    return danhSachHoKhauIds.filter((id) => !daNopIds.includes(id));
  }

  // Tạo mã phiếu thu tự động
  async generateMaPhieuThu(nam: number): Promise<string> {
    const count = await this.thuPhiModel.countDocuments({ nam });
    return `PT-${nam}-${String(count + 1).padStart(4, '0')}`;
  }

  // ====== API CHO CÁN BỘ KẾ TOÁN ======

  // Thống kê theo đợt thu (kyThu) - tổng tiền, số hộ đã nộp
  async thongKeTheoDotThu(kyThu: string, nam?: number): Promise<any> {
    const filter: any = { kyThu, trangThai: 'Đã thu' };
    if (nam) filter.nam = nam;

    const result = await this.thuPhiModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          tongTien: { $sum: '$tongTien' },
          soPhieuThu: { $sum: 1 },
          soHoDaNop: { $addToSet: '$hoKhauId' },
          chiTietKhoanThu: {
            $push: {
              hoKhauId: '$hoKhauId',
              tenChuHo: '$tenChuHo',
              diaChi: '$diaChi',
              tongTien: '$tongTien',
              chiTietThu: '$chiTietThu',
              ngayThu: '$ngayThu',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          tongTien: 1,
          soPhieuThu: 1,
          soHoDaNop: { $size: '$soHoDaNop' },
        },
      },
    ]);

    return result[0] || { tongTien: 0, soPhieuThu: 0, soHoDaNop: 0 };
  }

  // Danh sách các đợt thu trong năm
  async getDanhSachDotThu(nam: number): Promise<any[]> {
    return this.thuPhiModel.aggregate([
      { $match: { nam } },
      {
        $group: {
          _id: '$kyThu',
          tongTien: {
            $sum: { $cond: [{ $eq: ['$trangThai', 'Đã thu'] }, '$tongTien', 0] },
          },
          soHoDaNop: {
            $addToSet: {
              $cond: [{ $eq: ['$trangThai', 'Đã thu'] }, '$hoKhauId', null],
            },
          },
          soHoChuaNop: {
            $addToSet: {
              $cond: [{ $ne: ['$trangThai', 'Đã thu'] }, '$hoKhauId', null],
            },
          },
          tongPhieuThu: { $sum: 1 },
        },
      },
      {
        $project: {
          kyThu: '$_id',
          tongTien: 1,
          soHoDaNop: {
            $size: {
              $filter: {
                input: '$soHoDaNop',
                cond: { $ne: ['$$this', null] },
              },
            },
          },
          soHoChuaNop: {
            $size: {
              $filter: {
                input: '$soHoChuaNop',
                cond: { $ne: ['$$this', null] },
              },
            },
          },
          tongPhieuThu: 1,
        },
      },
      { $sort: { kyThu: 1 } },
    ]);
  }

  // Chi tiết từng hộ đã nộp trong đợt thu
  async getChiTietHoDaNopTheoDot(
    kyThu: string,
    nam?: number,
  ): Promise<ThuPhi[]> {
    const filter: any = { kyThu, trangThai: 'Đã thu' };
    if (nam) filter.nam = nam;

    return this.thuPhiModel
      .find(filter)
      .populate('hoKhauId')
      .populate('nguoiThu', 'hoTen username')
      .sort({ ngayThu: -1 })
      .exec();
  }

  // Chi tiết từng hộ chưa nộp trong đợt thu
  async getChiTietHoChuaNopTheoDot(
    kyThu: string,
    nam?: number,
  ): Promise<ThuPhi[]> {
    const filter: any = {
      kyThu,
      trangThai: { $in: ['Chưa thu', 'Đang nợ'] },
    };
    if (nam) filter.nam = nam;

    return this.thuPhiModel
      .find(filter)
      .populate('hoKhauId')
      .sort({ ngayThu: -1 })
      .exec();
  }

  // Thống kê tổng quan cho kế toán
  async thongKeTongQuan(nam: number): Promise<any> {
    const thongKeChung = await this.thuPhiModel.aggregate([
      { $match: { nam } },
      {
        $facet: {
          tongQuan: [
            {
              $group: {
                _id: '$trangThai',
                tongTien: { $sum: '$tongTien' },
                soPhieu: { $sum: 1 },
                danhSachHo: { $addToSet: '$hoKhauId' },
              },
            },
          ],
          theoThang: [
            { $match: { trangThai: 'Đã thu' } },
            {
              $group: {
                _id: { $month: '$ngayThu' },
                tongTien: { $sum: '$tongTien' },
                soPhieu: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          theoKhoanThu: [
            { $match: { trangThai: 'Đã thu' } },
            { $unwind: '$chiTietThu' },
            {
              $group: {
                _id: '$chiTietThu.tenKhoanThu',
                tongTien: { $sum: '$chiTietThu.soTien' },
                soLuot: { $sum: 1 },
              },
            },
            { $sort: { tongTien: -1 } },
          ],
        },
      },
    ]);

    const data = thongKeChung[0];

    // Xử lý tổng quan
    const daThu = data.tongQuan.find((x) => x._id === 'Đã thu') || {
      tongTien: 0,
      soPhieu: 0,
      danhSachHo: [],
    };
    const chuaThu = data.tongQuan.find((x) => x._id === 'Chưa thu') || {
      tongTien: 0,
      soPhieu: 0,
      danhSachHo: [],
    };
    const dangNo = data.tongQuan.find((x) => x._id === 'Đang nợ') || {
      tongTien: 0,
      soPhieu: 0,
      danhSachHo: [],
    };

    return {
      nam,
      tongQuan: {
        daThu: {
          tongTien: daThu.tongTien,
          soPhieu: daThu.soPhieu,
          soHo: daThu.danhSachHo.length,
        },
        chuaThu: {
          tongTien: chuaThu.tongTien,
          soPhieu: chuaThu.soPhieu,
          soHo: chuaThu.danhSachHo.length,
        },
        dangNo: {
          tongTien: dangNo.tongTien,
          soPhieu: dangNo.soPhieu,
          soHo: dangNo.danhSachHo.length,
        },
      },
      theoThang: data.theoThang.map((item) => ({
        thang: item._id,
        tongTien: item.tongTien,
        soPhieu: item.soPhieu,
      })),
      theoKhoanThu: data.theoKhoanThu,
    };
  }

  // Lịch sử nộp tiền của một hộ khẩu
  async getLichSuNopTien(hoKhauId: string, nam?: number): Promise<any> {
    const filter: any = { hoKhauId: new Types.ObjectId(hoKhauId) };
    if (nam) filter.nam = nam;

    const phieuThu = await this.thuPhiModel
      .find(filter)
      .populate('nguoiThu', 'hoTen username')
      .sort({ ngayThu: -1 })
      .exec();

    // Tính tổng theo trạng thái
    const tongKet = phieuThu.reduce(
      (acc, pt) => {
        if (pt.trangThai === 'Đã thu') {
          acc.daNop += pt.tongTien;
        } else {
          acc.conNo += pt.tongTien;
        }
        return acc;
      },
      { daNop: 0, conNo: 0 },
    );

    return {
      hoKhauId,
      tongKet,
      danhSachPhieuThu: phieuThu,
    };
  }
}
