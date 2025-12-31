import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNhanKhauDto } from './dto/create-nhan-khau.dto';
import { UpdateNhanKhauDto } from './dto/update-nhan-khau.dto';
import {
  NhanKhau,
  NhanKhauDocument,
  LichSuThayDoi,
} from './schemas/nhan-khau.schema';

@Injectable()
export class NhanKhauService {
  constructor(
    @InjectModel(NhanKhau.name) private nhanKhauModel: Model<NhanKhauDocument>,
  ) {}

  // Thêm nhân khẩu mới
  async create(createNhanKhauDto: CreateNhanKhauDto): Promise<NhanKhau> {
    const { hoKhauId, ...rest } = createNhanKhauDto;
    const createdNhanKhau = new this.nhanKhauModel({
      ...rest,
      hoKhauId: hoKhauId ? new Types.ObjectId(hoKhauId) : undefined,
    });
    return createdNhanKhau.save();
  }
  async themNhieu(createNhanKhauDto: CreateNhanKhauDto[]): Promise<NhanKhau[]> {
    const createdNhanKhau = createNhanKhauDto.map((dto) => {
      const { hoKhauId, ...rest } = dto;
      return new this.nhanKhauModel({
        ...rest,
        hoKhauId: hoKhauId ? new Types.ObjectId(hoKhauId) : undefined,
      });
    });
    return this.nhanKhauModel.insertMany(createdNhanKhau);
  }

  // Thêm nhân khẩu mới sinh
  async themMoiSinh(data: {
    hoTen: string;
    ngaySinh: Date;
    gioiTinh: string;
    hoKhauId: string;
    quanHeVoiChuHo: string;
    nguoiThucHien: string;
  }): Promise<NhanKhau> {
    const nhanKhau = new this.nhanKhauModel({
      hoTen: data.hoTen,
      ngaySinh: data.ngaySinh,
      gioiTinh: data.gioiTinh,
      hoKhauId: new Types.ObjectId(data.hoKhauId),
      quanHeVoiChuHo: data.quanHeVoiChuHo,
      moiSinh: true,
      trangThai: 'Thường trú',
      diaChiCu: { moiSinh: true, tinhThanh: 'Mới sinh' },
      lichSuThayDoi: [
        {
          noiDung: 'Thêm nhân khẩu mới sinh',
          ngayThayDoi: new Date(),
          nguoiThucHien: data.nguoiThucHien,
        },
      ],
    });
    return nhanKhau.save();
  }

  // Cập nhật nhân khẩu chuyển đi
  async chuyenDi(
    id: string,
    data: {
      ngayChuyenDi: Date;
      noiChuyenDen: string;
      lyDoChuyenDi?: string;
      nguoiThucHien: string;
    },
  ): Promise<NhanKhau | null> {
    const nhanKhau = await this.nhanKhauModel.findById(id);
    if (!nhanKhau) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    const lichSu: LichSuThayDoi = {
      noiDung: `Chuyển đi: ${data.noiChuyenDen}. ${data.lyDoChuyenDi || ''}`,
      ngayThayDoi: new Date(),
      nguoiThucHien: data.nguoiThucHien,
    };

    return this.nhanKhauModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            trangThai: 'Đã chuyển đi',
            ngayChuyenDi: data.ngayChuyenDi,
            noiChuyenDen: data.noiChuyenDen,
            lyDoChuyenDi: data.lyDoChuyenDi,
          },
          $push: { lichSuThayDoi: lichSu },
        },
        { new: true },
      )
      .exec();
  }

  // Đánh dấu nhân khẩu qua đời
  async quaDoi(
    id: string,
    data: {
      ngayMat: Date;
      nguoiThucHien: string;
    },
  ): Promise<NhanKhau | null> {
    const nhanKhau = await this.nhanKhauModel.findById(id);
    if (!nhanKhau) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    const lichSu: LichSuThayDoi = {
      noiDung: 'Đã qua đời',
      ngayThayDoi: data.ngayMat,
      nguoiThucHien: data.nguoiThucHien,
    };

    return this.nhanKhauModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            trangThai: 'Đã qua đời',
            ghiChu: 'Đã qua đời',
            ngayChuyenDi: data.ngayMat,
          },
          $push: { lichSuThayDoi: lichSu },
        },
        { new: true },
      )
      .exec();
  }

  async findAll(query?: {
    hoKhauId?: string;
    trangThai?: string;
    gioiTinh?: string;
  }): Promise<NhanKhau[]> {
    const filter: any = {};
    if (query?.hoKhauId) {
      filter.hoKhauId = new Types.ObjectId(query.hoKhauId);
    }
    if (query?.trangThai) {
      filter.trangThai = query.trangThai;
    }
    if (query?.gioiTinh) {
      filter.gioiTinh = query.gioiTinh;
    }
    return this.nhanKhauModel.find(filter).exec();
  }

  async findOne(id: string): Promise<NhanKhau | null> {
    return this.nhanKhauModel.findById(id).populate('hoKhauId').exec();
  }

  async findByCCCD(cccd: string): Promise<NhanKhau | null> {
    return this.nhanKhauModel
      .findOne({ 'soDinhDanh.so': cccd })
      .populate('hoKhauId')
      .exec();
  }

  async findByHoKhau(hoKhauId: string): Promise<NhanKhau[]> {
    return this.nhanKhauModel
      .find({ hoKhauId: new Types.ObjectId(hoKhauId) })
      .populate('hoKhauId')
      .exec();
  }

  // Lấy lịch sử thay đổi của nhân khẩu
  async getLichSuThayDoi(id: string): Promise<LichSuThayDoi[]> {
    const nhanKhau = await this.nhanKhauModel.findById(id).exec();
    if (!nhanKhau) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }
    return nhanKhau.lichSuThayDoi || [];
  }

  async update(
    id: string,
    updateNhanKhauDto: UpdateNhanKhauDto,
    nguoiThucHien?: string,
  ): Promise<NhanKhau | null> {
    const updateData: any = { ...updateNhanKhauDto };

    if (nguoiThucHien) {
      const lichSu: LichSuThayDoi = {
        noiDung: 'Cập nhật thông tin nhân khẩu',
        ngayThayDoi: new Date(),
        nguoiThucHien,
      };
      updateData.$push = { lichSuThayDoi: lichSu };
    }

    return this.nhanKhauModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('hoKhauId')
      .exec();
  }

  async remove(id: string): Promise<NhanKhau | null> {
    return this.nhanKhauModel.findByIdAndDelete(id).exec();
  }

  // Tìm kiếm nhân khẩu
  async search(keyword: string): Promise<NhanKhau[]> {
    return this.nhanKhauModel
      .find({
        $or: [
          { hoTen: { $regex: keyword, $options: 'i' } },
          { 'soDinhDanh.so': { $regex: keyword, $options: 'i' } },
          { biDanh: { $regex: keyword, $options: 'i' } },
        ],
      })
      .populate('hoKhauId')
      .exec();
  }

  // Thống kê theo giới tính
  async thongKeTheoGioiTinh(): Promise<any> {
    return this.nhanKhauModel.aggregate([
      { $match: { trangThai: { $in: ['Thường trú', 'Tạm trú'] } } },
      { $group: { _id: '$gioiTinh', soLuong: { $sum: 1 } } },
    ]);
  }

  // Thống kê theo độ tuổi
  async thongKeTheoDoTuoi(): Promise<any> {
    const now = new Date();
    const result = await this.nhanKhauModel.aggregate([
      { $match: { trangThai: { $in: ['Thường trú', 'Tạm trú'] } } },
      {
        $addFields: {
          tuoi: {
            $floor: {
              $divide: [
                { $subtract: [now, '$ngaySinh'] },
                365.25 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          nhomTuoi: {
            $switch: {
              branches: [
                { case: { $lt: ['$tuoi', 3] }, then: 'Mầm non (0-2)' },
                { case: { $lt: ['$tuoi', 6] }, then: 'Mẫu giáo (3-5)' },
                { case: { $lt: ['$tuoi', 11] }, then: 'Cấp 1 (6-10)' },
                { case: { $lt: ['$tuoi', 15] }, then: 'Cấp 2 (11-14)' },
                { case: { $lt: ['$tuoi', 18] }, then: 'Cấp 3 (15-17)' },
                {
                  case: { $lt: ['$tuoi', 60] },
                  then: 'Độ tuổi lao động (18-59)',
                },
              ],
              default: 'Nghỉ hưu (60+)',
            },
          },
        },
      },
      { $group: { _id: '$nhomTuoi', soLuong: { $sum: 1 } } },
    ]);

    return result;
  }

  // Thống kê tổng quan
  async thongKeTongQuan(): Promise<any> {
    const [tong, thuongTru, tamTru, tamVang, daChuyenDi, daQuaDoi] =
      await Promise.all([
        this.nhanKhauModel.countDocuments(),
        this.nhanKhauModel.countDocuments({ trangThai: 'Thường trú' }),
        this.nhanKhauModel.countDocuments({ trangThai: 'Tạm trú' }),
        this.nhanKhauModel.countDocuments({ trangThai: 'Tạm vắng' }),
        this.nhanKhauModel.countDocuments({ trangThai: 'Đã chuyển đi' }),
        this.nhanKhauModel.countDocuments({ trangThai: 'Đã qua đời' }),
      ]);

    return {
      tong,
      thuongTru,
      tamTru,
      tamVang,
      daChuyenDi,
      daQuaDoi,
    };
  }

  // Tính tuổi trung bình
  async tinhTuoiTrungBinh(): Promise<any> {
    const now = new Date();
    const result = await this.nhanKhauModel.aggregate([
      { $match: { trangThai: { $in: ['Thường trú', 'Tạm trú'] } } },
      {
        $addFields: {
          tuoi: {
            $floor: {
              $divide: [
                { $subtract: [now, '$ngaySinh'] },
                365.25 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          tuoiTrungBinh: { $avg: '$tuoi' },
          soLuong: { $sum: 1 },
          tuoiNhoNhat: { $min: '$tuoi' },
          tuoiLonNhat: { $max: '$tuoi' },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        tuoiTrungBinh: 0,
        soLuong: 0,
        tuoiNhoNhat: 0,
        tuoiLonNhat: 0,
      };
    }

    return {
      tuoiTrungBinh: Math.round(result[0].tuoiTrungBinh * 10) / 10,
      soLuong: result[0].soLuong,
      tuoiNhoNhat: result[0].tuoiNhoNhat,
      tuoiLonNhat: result[0].tuoiLonNhat,
    };
  }

  // Đếm nhân khẩu theo hộ khẩu
  async demNhanKhauTheoHoKhau(hoKhauId: string): Promise<number> {
    return this.nhanKhauModel.countDocuments({
      hoKhauId: new Types.ObjectId(hoKhauId),
      trangThai: { $in: ['Thường trú', 'Tạm trú'] },
    });
  }

  // 🟢 HÀM MỚI ĐƯỢC THÊM VÀO ĐÂY (Nằm TRONG class, trước dấu ngoặc đóng cuối cùng)
  async getThongKe() {
    // Sửa điều kiện lọc: Chỉ lấy Thường trú và Tạm trú (bỏ Tạm vắng và Đã chuyển đi)
    // Nếu bạn muốn tính cả Tạm vắng, hãy thêm 'Tạm vắng' vào mảng bên dưới
    const allNhanKhau = await this.nhanKhauModel.find({
      trangThai: { $in: ['Thường trú', 'Tạm trú'] },
    });

    const total = allNhanKhau.length;
    let male = 0;
    let female = 0;
    let totalAge = 0;
    let validAgeCount = 0;
    const now = new Date();

    allNhanKhau.forEach((p) => {
      // Đếm giới tính
      if (p.gioiTinh === 'Nam') male++;
      else if (p.gioiTinh === 'Nữ') female++;

      // Tính tuổi
      if (p.ngaySinh) {
        const birthDate = new Date(p.ngaySinh);
        let age = now.getFullYear() - birthDate.getFullYear();
        const m = now.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age >= 0) {
          totalAge += age;
          validAgeCount++;
        }
      }
    });

    const avgAge =
      validAgeCount > 0 ? (totalAge / validAgeCount).toFixed(1) : 0;

    return {
      total,
      male,
      female,
      avgAge,
    };
  }
}
