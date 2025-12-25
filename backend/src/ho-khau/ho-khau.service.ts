import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateHoKhauDto } from './dto/create-ho-khau.dto';
import { UpdateHoKhauDto } from './dto/update-ho-khau.dto';
import {
  HoKhau,
  HoKhauDocument,
  LichSuThayDoiHoKhau,
} from './schemas/ho-khau.schema';
import {
  NhanKhau,
  NhanKhauDocument,
} from '../nhan-khau/schemas/nhan-khau.schema';

@Injectable()
export class HoKhauService {
  constructor(
    @InjectModel(HoKhau.name) private hoKhauModel: Model<HoKhauDocument>,
    @InjectModel(NhanKhau.name)
    private nhanKhauModel: Model<NhanKhauDocument>,
  ) {}

  async create(createHoKhauDto: CreateHoKhauDto): Promise<HoKhau> {
    const { thanhVien, chuHo } = createHoKhauDto;
    const thanhVienWithObjectIds = thanhVien?.map((tv) => ({
      ...tv,
      nhanKhauId: new Types.ObjectId(tv.nhanKhauId),
    }));
    const chuHoObjectId = new Types.ObjectId(chuHo.nhanKhauId);

    const createdHoKhau = new this.hoKhauModel({
      ...createHoKhauDto,
      chuHo: {
        nhanKhauId: chuHoObjectId,
        hoTen: chuHo.hoTen,
      },
      thanhVien: thanhVienWithObjectIds,
      ngayLap: new Date(),
    });
    return createdHoKhau.save();
  }

  async findAll(query?: {
    trangThai?: string;
    search?: string;
  }): Promise<HoKhau[]> {
    const filter: any = {};
    if (query?.trangThai) {
      filter.trangThai = query.trangThai;
    }
    if (query?.search) {
      filter.$or = [{ 'chuHo.hoTen': { $regex: query.search, $options: 'i' } }];
    }
    return this.hoKhauModel.find(filter).populate('chuHo.nhanKhauId').exec();
  }

  async findOne(id: string): Promise<HoKhau | null> {
    return this.hoKhauModel.findById(id).populate('chuHo.nhanKhauId').exec();
  }

  async findByMaHoKhau(maHoKhau: string): Promise<HoKhau | null> {
    return this.hoKhauModel
      .findOne({ _id: maHoKhau })
      .populate('chuHo.nhanKhauId')
      .exec();
  }

  // Thay đổi chủ hộ
  async thayDoiChuHo(
    hoKhauId: string,
    data: {
      chuHoMoiId: string;
      hoTenChuHoMoi: string;
      nguoiThucHien: string;
      lyDo?: string;
    },
  ): Promise<HoKhau | null> {
    const hoKhau = await this.hoKhauModel.findById(hoKhauId);
    if (!hoKhau) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    const lichSu: LichSuThayDoiHoKhau = {
      noiDung: `Thay đổi chủ hộ từ "${hoKhau.chuHo.hoTen}" sang "${data.hoTenChuHoMoi}". ${data.lyDo || ''}`,
      ngayThayDoi: new Date(),
      nguoiThucHien: data.nguoiThucHien,
    };

    return this.hoKhauModel
      .findByIdAndUpdate(
        hoKhauId,
        {
          $set: {
            chuHo: {
              nhanKhauId: new Types.ObjectId(data.chuHoMoiId),
              hoTen: data.hoTenChuHoMoi,
            },
          },
          $push: { lichSuThayDoi: lichSu },
        },
        { new: true },
      )
      .exec();
  }

  // Tách hộ
  async tachHo(data: {
    hoKhauGocId: string;
    chuHoMoi: { nhanKhauId: string; hoTen: string };
    diaChi: any;
    danhSachNhanKhauId: string[]; // Danh sách nhân khẩu chuyển sang hộ mới
    nguoiThucHien: string;
  }): Promise<HoKhau> {
    const hoKhauGoc = await this.hoKhauModel.findById(data.hoKhauGocId);
    if (!hoKhauGoc) {
      throw new NotFoundException('Không tìm thấy hộ khẩu gốc');
    }
    const thanhVienGoc = hoKhauGoc.thanhVien.map((tv) =>
      tv.nhanKhauId.toString(),
    );
    // Kiểm tra mã hộ khẩu mới đã tồn tại chưa
    const isHopLe = data.danhSachNhanKhauId.every((id) =>
      thanhVienGoc.includes(id),
    );
    if (!isHopLe) {
      throw new BadRequestException(
        'Danh sách nhân khẩu không hợp lệ hoặc không thuộc hộ khẩu gốc',
      );
    }
    // Tạo hộ khẩu mới
    const hoKhauMoi = new this.hoKhauModel({
      chuHo: {
        nhanKhauId: new Types.ObjectId(data.chuHoMoi.nhanKhauId),
        hoTen: data.chuHoMoi.hoTen,
      },
      diaChi: data.diaChi,
      thanhVien: data.danhSachNhanKhauId.map((id) => ({
        nhanKhauId: new Types.ObjectId(id),
      })),
      ngayLap: new Date(),
      trangThai: 'Đang hoạt động',
      lichSuThayDoi: [
        {
          noiDung: `Tách hộ từ hộ khẩu ${data.hoKhauGocId}`,
          ngayThayDoi: new Date(),
          nguoiThucHien: data.nguoiThucHien,
        },
      ],
    });

    const savedHoKhauMoi = await hoKhauMoi.save();

    const nhanKhauChuyenSangHoMoiIds = Array.from(
      new Set([...(data.danhSachNhanKhauId || []), data.chuHoMoi.nhanKhauId]),
    ).map((id) => new Types.ObjectId(id));

    await this.nhanKhauModel.updateMany(
      { _id: { $in: nhanKhauChuyenSangHoMoiIds } },
      { $set: { hoKhauId: savedHoKhauMoi._id } },
    );

    // Cập nhật lịch sử hộ khẩu gốc
    const lichSuGoc: LichSuThayDoiHoKhau = {
      noiDung: `Tách hộ sang hộ khẩu mới:  ${savedHoKhauMoi._id}`,
      ngayThayDoi: new Date(),
      nguoiThucHien: data.nguoiThucHien,
    };

    await this.hoKhauModel.findByIdAndUpdate(data.hoKhauGocId, {
      $push: { lichSuThayDoi: lichSuGoc },
      $pull: {
        thanhVien: {
          nhanKhauId: {
            $in: data.danhSachNhanKhauId.map((id) => new Types.ObjectId(id)),
          },
        },
      },
    });

    return hoKhauMoi;
  }

  // Thêm thành viên vào hộ khẩu
  async themThanhVien(
    hoKhauId: string,
    thanhVien: { nhanKhauId: string; hoTen: string; quanHeVoiChuHo: string },
    nguoiThucHien: string,
  ): Promise<HoKhau | null> {
    const lichSu: LichSuThayDoiHoKhau = {
      noiDung: `Thêm thành viên: ${thanhVien.hoTen}`,
      ngayThayDoi: new Date(),
      nguoiThucHien,
    };

    return this.hoKhauModel
      .findByIdAndUpdate(
        hoKhauId,
        {
          $push: {
            thanhVien: {
              nhanKhauId: new Types.ObjectId(thanhVien.nhanKhauId),
              hoTen: thanhVien.hoTen,
              quanHeVoiChuHo: thanhVien.quanHeVoiChuHo,
            },
            lichSuThayDoi: lichSu,
          },
        },
        { new: true },
      )
      .exec();
  }

  // Xóa thành viên khỏi hộ khẩu
  async xoaThanhVien(
    hoKhauId: string,
    nhanKhauId: string,
    nguoiThucHien: string,
  ): Promise<HoKhau | null> {
    const lichSu: LichSuThayDoiHoKhau = {
      noiDung: `Xóa thành viên khỏi hộ khẩu`,
      ngayThayDoi: new Date(),
      nguoiThucHien,
    };

    return this.hoKhauModel
      .findByIdAndUpdate(
        hoKhauId,
        {
          $pull: { thanhVien: { nhanKhauId: new Types.ObjectId(nhanKhauId) } },
          $push: { lichSuThayDoi: lichSu },
        },
        { new: true },
      )
      .exec();
  }

  // Lấy lịch sử thay đổi hộ khẩu
  async getLichSuThayDoi(hoKhauId: string): Promise<LichSuThayDoiHoKhau[]> {
    const hoKhau = await this.hoKhauModel.findById(hoKhauId).exec();
    if (!hoKhau) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }
    return hoKhau.lichSuThayDoi || [];
  }

  async update(
    id: string,
    updateHoKhauDto: UpdateHoKhauDto,
    nguoiThucHien?: string,
  ): Promise<any> {
    const updateData: any = { $set: { ...updateHoKhauDto } };

    if (nguoiThucHien) {
      const lichSu: LichSuThayDoiHoKhau = {
        noiDung: updateHoKhauDto.ghiChu || 'Cập nhật thông tin hộ khẩu',
        ngayThayDoi: new Date(),
        nguoiThucHien,
      };
      updateData.$push = { lichSuThayDoi: lichSu };
    }

    return this.hoKhauModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<HoKhau | null> {
    return this.hoKhauModel.findByIdAndDelete(id).exec();
  }

  // Thống kê tổng số hộ khẩu
  async thongKe(): Promise<any> {
    const [tong, dangHoatDong, daTachHo, daXoa] = await Promise.all([
      this.hoKhauModel.countDocuments(),
      this.hoKhauModel.countDocuments({ trangThai: 'Đang hoạt động' }),
      this.hoKhauModel.countDocuments({ trangThai: 'Đã tách hộ' }),
      this.hoKhauModel.countDocuments({ trangThai: 'Đã xóa' }),
    ]);

    return {
      tong,
      dangHoatDong,
      daTachHo,
      daXoa,
    };
  }

  // Tạo mã hộ khẩu tự động
  async generateMaHoKhau(): Promise<string> {
    const count = await this.hoKhauModel.countDocuments();
    return `HK-${String(count + 1).padStart(5, '0')}`;
  }

  // Lấy danh sách hộ khẩu đang hoạt động (dùng cho thu phí)
  async getDanhSachHoKhauActive(): Promise<HoKhau[]> {
    return this.hoKhauModel.find({ trangThai: 'Đang hoạt động' }).exec();
  }
}
