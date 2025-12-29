import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
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

// Interface cho thành viên (dùng trong response)
export interface ThanhVienResponse {
  nhanKhauId: string;
  hoTen: string;
  quanHeVoiChuHo: string;
  ngaySinh?: Date;
  gioiTinh?: string;
  trangThai?: string;
}

// Interface cho response hộ khẩu (bao gồm thành viên từ NhanKhau)
export interface HoKhauResponse {
  _id: Types.ObjectId;
  chuHoId: Types.ObjectId;
  chuHo?: {
    _id: string;
    hoTen: string;
    ngaySinh?: Date;
    gioiTinh?: string;
  };
  diaChi: {
    soNha?: string;
    duong?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
  };
  trangThai: string;
  ngayLap: Date;
  ghiChu?: string;
  lichSuThayDoi?: LichSuThayDoiHoKhau[];
  thanhVien: ThanhVienResponse[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class HoKhauService {
  constructor(
    @InjectModel(HoKhau.name) private hoKhauModel: Model<HoKhauDocument>,
    @InjectModel(NhanKhau.name) private nhanKhauModel: Model<NhanKhauDocument>,
  ) {}

  // Helper: Lấy thành viên từ NhanKhau theo hoKhauId
  private async getThanhVien(hoKhauId: string): Promise<ThanhVienResponse[]> {
    const members = await this.nhanKhauModel
      .find({ hoKhauId: new Types.ObjectId(hoKhauId) })
      .select('_id hoTen quanHeVoiChuHo ngaySinh gioiTinh trangThai')
      .exec();

    return members.map((m: NhanKhauDocument) => ({
      nhanKhauId: (m._id as Types.ObjectId).toString(),
      hoTen: m.hoTen,
      quanHeVoiChuHo: m.quanHeVoiChuHo || 'Chưa xác định',
      ngaySinh: m.ngaySinh,
      gioiTinh: m.gioiTinh,
      trangThai: m.trangThai,
    }));
  }

  // Helper: Convert HoKhau document to response (với thành viên)
  private async toResponse(hoKhau: HoKhauDocument): Promise<HoKhauResponse> {
    const thanhVien = await this.getThanhVien(
      (hoKhau._id as Types.ObjectId).toString(),
    );

    // Populate chuHo
    const chuHo = await this.nhanKhauModel
      .findById(hoKhau.chuHoId)
      .select('_id hoTen ngaySinh gioiTinh')
      .exec();

    return {
      _id: hoKhau._id as Types.ObjectId,
      chuHoId: hoKhau.chuHoId as Types.ObjectId,
      chuHo: chuHo
        ? {
            _id: (chuHo._id as Types.ObjectId).toString(),
            hoTen: chuHo.hoTen,
            ngaySinh: chuHo.ngaySinh,
            gioiTinh: chuHo.gioiTinh,
          }
        : undefined,
      diaChi: hoKhau.diaChi,
      trangThai: hoKhau.trangThai,
      ngayLap: hoKhau.ngayLap,
      ghiChu: hoKhau.ghiChu,
      lichSuThayDoi: hoKhau.lichSuThayDoi,
      thanhVien,
      createdAt: (hoKhau as HoKhauDocument & { createdAt?: Date }).createdAt,
      updatedAt: (hoKhau as HoKhauDocument & { updatedAt?: Date }).updatedAt,
    };
  }

  async create(createHoKhauDto: CreateHoKhauDto): Promise<HoKhauResponse> {
    const { chuHoId, diaChi, trangThai, ghiChu, thanhVien } = createHoKhauDto;

    // Kiểm tra chủ hộ tồn tại
    const chuHo = await this.nhanKhauModel.findById(chuHoId);
    if (!chuHo) {
      throw new BadRequestException('Không tìm thấy nhân khẩu làm chủ hộ');
    }

    // Tạo hộ khẩu mới
    const createdHoKhau = new this.hoKhauModel({
      chuHoId: new Types.ObjectId(chuHoId),
      diaChi,
      trangThai: trangThai || 'Đang hoạt động',
      ghiChu,
      ngayLap: new Date(),
      lichSuThayDoi: [
        {
          noiDung: `Tạo hộ khẩu mới với chủ hộ: ${chuHo.hoTen}`,
          ngayThayDoi: new Date(),
          nguoiThucHien: 'System',
        },
      ],
    });

    const savedHoKhau = await createdHoKhau.save();

    // Cập nhật hoKhauId và quanHeVoiChuHo cho chủ hộ
    await this.nhanKhauModel.findByIdAndUpdate(chuHoId, {
      hoKhauId: savedHoKhau._id,
      quanHeVoiChuHo: 'Chủ hộ',
    });

    // Cập nhật hoKhauId và quanHeVoiChuHo cho các thành viên khác (nếu có)
    if (thanhVien && thanhVien.length > 0) {
      for (const tv of thanhVien) {
        if (tv.nhanKhauId !== chuHoId) {
          await this.nhanKhauModel.findByIdAndUpdate(tv.nhanKhauId, {
            hoKhauId: savedHoKhau._id,
            quanHeVoiChuHo: tv.quanHeVoiChuHo,
          });
        }
      }
    }

    return this.toResponse(savedHoKhau);
  }

  async findAll(query?: {
    trangThai?: string;
    search?: string;
  }): Promise<HoKhauResponse[]> {
    const filter: FilterQuery<HoKhauDocument> = {};
    if (query?.trangThai) {
      filter.trangThai = query.trangThai;
    }

    let hoKhauList = await this.hoKhauModel.find(filter).exec();

    // Nếu có search, tìm theo tên chủ hộ
    if (query?.search) {
      const searchRegex = new RegExp(query.search, 'i');
      const chuHoIds = hoKhauList.map((hk) => hk.chuHoId as Types.ObjectId);
      const matchingChuHo = await this.nhanKhauModel
        .find({
          _id: { $in: chuHoIds },
          hoTen: searchRegex,
        })
        .select('_id')
        .exec();
      const matchingIds = new Set(
        matchingChuHo.map((c: NhanKhauDocument) =>
          (c._id as Types.ObjectId).toString(),
        ),
      );
      hoKhauList = hoKhauList.filter((hk) =>
        matchingIds.has((hk.chuHoId as Types.ObjectId).toString()),
      );
    }

    return Promise.all(hoKhauList.map((hk) => this.toResponse(hk)));
  }

  async findOne(id: string): Promise<HoKhauResponse | null> {
    const hoKhau = await this.hoKhauModel.findById(id).exec();
    if (!hoKhau) return null;
    return this.toResponse(hoKhau);
  }

  async findByMaHoKhau(maHoKhau: string): Promise<HoKhauResponse | null> {
    const hoKhau = await this.hoKhauModel.findOne({ _id: maHoKhau }).exec();
    if (!hoKhau) return null;
    return this.toResponse(hoKhau);
  }

  // Thay đổi chủ hộ
  async thayDoiChuHo(
    hoKhauId: string,
    data: {
      chuHoMoiId: string;
      nguoiThucHien: string;
      lyDo?: string;
    },
  ): Promise<HoKhauResponse | null> {
    const hoKhau = await this.hoKhauModel.findById(hoKhauId);
    if (!hoKhau) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    // Kiểm tra chủ hộ mới tồn tại và thuộc hộ khẩu này
    const chuHoMoi = await this.nhanKhauModel.findById(data.chuHoMoiId);
    if (!chuHoMoi) {
      throw new BadRequestException('Không tìm thấy nhân khẩu làm chủ hộ mới');
    }
    if (chuHoMoi.hoKhauId?.toString() !== hoKhauId) {
      throw new BadRequestException(
        'Chủ hộ mới phải là thành viên trong hộ khẩu',
      );
    }

    // Lấy thông tin chủ hộ cũ
    const chuHoCu = await this.nhanKhauModel.findById(hoKhau.chuHoId);
    const tenChuHoCu = chuHoCu?.hoTen || 'N/A';

    // Cập nhật quan hệ: chủ hộ cũ -> quan hệ khác, chủ hộ mới -> "Chủ hộ"
    await this.nhanKhauModel.findByIdAndUpdate(hoKhau.chuHoId, {
      quanHeVoiChuHo: 'Khác',
    });
    await this.nhanKhauModel.findByIdAndUpdate(data.chuHoMoiId, {
      quanHeVoiChuHo: 'Chủ hộ',
    });

    const lichSu: LichSuThayDoiHoKhau = {
      noiDung: `Thay đổi chủ hộ từ "${tenChuHoCu}" sang "${chuHoMoi.hoTen}". ${data.lyDo || ''}`,
      ngayThayDoi: new Date(),
      nguoiThucHien: data.nguoiThucHien,
    };

    const updated = await this.hoKhauModel
      .findByIdAndUpdate(
        hoKhauId,
        {
          $set: { chuHoId: new Types.ObjectId(data.chuHoMoiId) },
          $push: { lichSuThayDoi: lichSu },
        },
        { new: true },
      )
      .exec();

    return updated ? this.toResponse(updated) : null;
  }

  // Tách hộ
  async tachHo(data: {
    hoKhauGocId: string;
    chuHoMoi: { nhanKhauId: string };
    diaChi: {
      soNha?: string;
      duong?: string;
      phuongXa?: string;
      quanHuyen?: string;
      tinhThanh?: string;
    };
    danhSachNhanKhauMoi: { nhanKhauId: string; quanHeVoiChuHo: string }[];
    chuHoMoiChoHoGoc?: { nhanKhauId: string };
    nguoiThucHien: string;
  }): Promise<HoKhauResponse> {
    const hoKhauGoc = await this.hoKhauModel.findById(data.hoKhauGocId);
    if (!hoKhauGoc) {
      throw new NotFoundException('Không tìm thấy hộ khẩu gốc');
    }

    // Lấy danh sách thành viên hiện tại từ NhanKhau
    const thanhVienGoc = await this.nhanKhauModel
      .find({ hoKhauId: new Types.ObjectId(data.hoKhauGocId) })
      .select('_id hoTen quanHeVoiChuHo')
      .exec();
    const thanhVienGocIds = thanhVienGoc.map((tv) =>
      String((tv as NhanKhauDocument)._id),
    );

    // Kiểm tra danh sách nhân khẩu tách hợp lệ
    const isHopLe = data.danhSachNhanKhauMoi.every((tv) =>
      thanhVienGocIds.includes(tv.nhanKhauId),
    );
    if (!isHopLe) {
      throw new BadRequestException(
        'Danh sách nhân khẩu không hợp lệ hoặc không thuộc hộ khẩu gốc',
      );
    }

    // Kiểm tra xem chủ hộ gốc có nằm trong danh sách tách không
    const chuHoGocId = String(hoKhauGoc.chuHoId);
    const chuHoBiTach = data.danhSachNhanKhauMoi.some(
      (tv) => tv.nhanKhauId === chuHoGocId,
    );

    // Tính toán thành viên còn lại trong hộ gốc
    const danhSachTachIds = new Set(
      data.danhSachNhanKhauMoi.map((tv) => tv.nhanKhauId),
    );
    const thanhVienConLai = thanhVienGoc.filter(
      (tv) => !danhSachTachIds.has(String((tv as NhanKhauDocument)._id)),
    );

    // Nếu chủ hộ bị tách và còn thành viên ở lại, phải có chủ hộ mới cho hộ gốc
    if (chuHoBiTach && thanhVienConLai.length > 0) {
      if (!data.chuHoMoiChoHoGoc?.nhanKhauId) {
        throw new BadRequestException(
          'Chủ hộ hiện tại nằm trong danh sách tách hộ. Vui lòng chỉ định chủ hộ mới cho hộ gốc.',
        );
      }

      const chuHoMoiHopLe = thanhVienConLai.some(
        (tv) =>
          String((tv as NhanKhauDocument)._id) ===
          data.chuHoMoiChoHoGoc?.nhanKhauId,
      );
      if (!chuHoMoiHopLe) {
        throw new BadRequestException(
          'Chủ hộ mới cho hộ gốc phải là thành viên còn lại trong hộ.',
        );
      }
    }

    // Kiểm tra chủ hộ mới cho hộ tách
    const chuHoMoi = await this.nhanKhauModel.findById(
      data.chuHoMoi.nhanKhauId,
    );
    if (!chuHoMoi) {
      throw new BadRequestException('Không tìm thấy nhân khẩu làm chủ hộ mới');
    }

    // Tạo hộ khẩu mới
    const hoKhauMoi = new this.hoKhauModel({
      chuHoId: new Types.ObjectId(data.chuHoMoi.nhanKhauId),
      diaChi: data.diaChi,
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

    // Cập nhật hoKhauId và quanHeVoiChuHo cho các nhân khẩu chuyển sang hộ mới
    for (const tv of data.danhSachNhanKhauMoi) {
      const quanHe =
        tv.nhanKhauId === data.chuHoMoi.nhanKhauId
          ? 'Chủ hộ'
          : tv.quanHeVoiChuHo || 'Khác';
      await this.nhanKhauModel.findByIdAndUpdate(tv.nhanKhauId, {
        hoKhauId: savedHoKhauMoi._id,
        quanHeVoiChuHo: quanHe,
      });
    }

    // Cập nhật lịch sử hộ khẩu gốc
    const hoKhauMoiId = (savedHoKhauMoi._id as Types.ObjectId).toString();
    const lichSuGoc: LichSuThayDoiHoKhau = {
      noiDung: `Tách hộ sang hộ khẩu mới: ${hoKhauMoiId}`,
      ngayThayDoi: new Date(),
      nguoiThucHien: data.nguoiThucHien,
    };

    await this.hoKhauModel.findByIdAndUpdate(data.hoKhauGocId, {
      $push: { lichSuThayDoi: lichSuGoc },
    });

    // Nếu chủ hộ bị tách và còn thành viên ở lại, cập nhật chủ hộ mới cho hộ gốc
    if (chuHoBiTach && thanhVienConLai.length > 0 && data.chuHoMoiChoHoGoc) {
      const chuHoGoc = await this.nhanKhauModel.findById(chuHoGocId);
      const chuHoMoiChoHoGoc = await this.nhanKhauModel.findById(
        data.chuHoMoiChoHoGoc.nhanKhauId,
      );

      const lichSuDoiChuHo: LichSuThayDoiHoKhau = {
        noiDung: `Đổi chủ hộ từ "${chuHoGoc?.hoTen || 'N/A'}" sang "${chuHoMoiChoHoGoc?.hoTen || 'N/A'}" do tách hộ`,
        ngayThayDoi: new Date(),
        nguoiThucHien: data.nguoiThucHien,
      };

      await this.hoKhauModel.findByIdAndUpdate(data.hoKhauGocId, {
        $set: {
          chuHoId: new Types.ObjectId(data.chuHoMoiChoHoGoc.nhanKhauId),
        },
        $push: { lichSuThayDoi: lichSuDoiChuHo },
      });

      // Cập nhật quan hệ cho chủ hộ mới của hộ gốc
      await this.nhanKhauModel.findByIdAndUpdate(
        data.chuHoMoiChoHoGoc.nhanKhauId,
        {
          quanHeVoiChuHo: 'Chủ hộ',
        },
      );
    }

    // Nếu chủ hộ bị tách và không còn thành viên nào, đánh dấu hộ gốc là "Đã tách hộ"
    if (chuHoBiTach && thanhVienConLai.length === 0) {
      await this.hoKhauModel.findByIdAndUpdate(data.hoKhauGocId, {
        $set: { trangThai: 'Đã tách hộ' },
        $push: {
          lichSuThayDoi: {
            noiDung: 'Hộ khẩu đã tách hoàn toàn, không còn thành viên',
            ngayThayDoi: new Date(),
            nguoiThucHien: data.nguoiThucHien,
          },
        },
      });
    }

    return this.toResponse(savedHoKhauMoi);
  }

  // Cập nhật quan hệ với chủ hộ của một thành viên
  async capNhatQuanHe(
    hoKhauId: string,
    nhanKhauId: string,
    quanHeVoiChuHo: string,
    nguoiThucHien: string,
  ): Promise<HoKhauResponse | null> {
    const hoKhau = await this.hoKhauModel.findById(hoKhauId);
    if (!hoKhau) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    // Kiểm tra nhân khẩu có thuộc hộ khẩu này không
    const nhanKhau = await this.nhanKhauModel.findById(nhanKhauId);
    if (!nhanKhau || nhanKhau.hoKhauId?.toString() !== hoKhauId) {
      throw new BadRequestException('Nhân khẩu không thuộc hộ khẩu này');
    }

    // Cập nhật quan hệ trong NhanKhau
    await this.nhanKhauModel.findByIdAndUpdate(nhanKhauId, {
      quanHeVoiChuHo,
    });

    const lichSu: LichSuThayDoiHoKhau = {
      noiDung: `Cập nhật quan hệ của "${nhanKhau.hoTen}" với chủ hộ: ${quanHeVoiChuHo}`,
      ngayThayDoi: new Date(),
      nguoiThucHien,
    };

    const updated = await this.hoKhauModel
      .findByIdAndUpdate(
        hoKhauId,
        { $push: { lichSuThayDoi: lichSu } },
        { new: true },
      )
      .exec();

    return updated ? this.toResponse(updated) : null;
  }

  // Thêm thành viên vào hộ khẩu
  async themThanhVien(
    hoKhauId: string,
    thanhVien: { nhanKhauId: string; quanHeVoiChuHo: string },
    nguoiThucHien: string,
  ): Promise<HoKhauResponse | null> {
    const hoKhau = await this.hoKhauModel.findById(hoKhauId);
    if (!hoKhau) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    // Kiểm tra nhân khẩu tồn tại
    const nhanKhau = await this.nhanKhauModel.findById(thanhVien.nhanKhauId);
    if (!nhanKhau) {
      throw new BadRequestException('Không tìm thấy nhân khẩu');
    }

    // Kiểm tra nhân khẩu đã có hộ khẩu chưa
    if (nhanKhau.hoKhauId) {
      throw new BadRequestException('Nhân khẩu đã thuộc một hộ khẩu khác');
    }

    // Cập nhật hoKhauId và quanHeVoiChuHo cho nhân khẩu
    await this.nhanKhauModel.findByIdAndUpdate(thanhVien.nhanKhauId, {
      hoKhauId: new Types.ObjectId(hoKhauId),
      quanHeVoiChuHo: thanhVien.quanHeVoiChuHo,
    });

    const lichSu: LichSuThayDoiHoKhau = {
      noiDung: `Thêm thành viên: ${nhanKhau.hoTen}`,
      ngayThayDoi: new Date(),
      nguoiThucHien,
    };

    const updated = await this.hoKhauModel
      .findByIdAndUpdate(
        hoKhauId,
        { $push: { lichSuThayDoi: lichSu } },
        { new: true },
      )
      .exec();

    return updated ? this.toResponse(updated) : null;
  }

  // Xóa thành viên khỏi hộ khẩu
  async xoaThanhVien(
    hoKhauId: string,
    nhanKhauId: string,
    nguoiThucHien: string,
  ): Promise<HoKhauResponse | null> {
    const hoKhau = await this.hoKhauModel.findById(hoKhauId);
    if (!hoKhau) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    // Kiểm tra không được xóa chủ hộ
    if (String(hoKhau.chuHoId) === nhanKhauId) {
      throw new BadRequestException(
        'Không thể xóa chủ hộ khỏi hộ khẩu. Hãy đổi chủ hộ trước.',
      );
    }

    // Kiểm tra nhân khẩu có thuộc hộ khẩu này không
    const nhanKhau = await this.nhanKhauModel.findById(nhanKhauId);
    if (!nhanKhau || nhanKhau.hoKhauId?.toString() !== hoKhauId) {
      throw new BadRequestException('Nhân khẩu không thuộc hộ khẩu này');
    }

    // Xóa hoKhauId và quanHeVoiChuHo khỏi nhân khẩu
    await this.nhanKhauModel.findByIdAndUpdate(nhanKhauId, {
      $unset: { hoKhauId: 1, quanHeVoiChuHo: 1 },
    });

    const lichSu: LichSuThayDoiHoKhau = {
      noiDung: `Xóa thành viên khỏi hộ khẩu: ${nhanKhau.hoTen}`,
      ngayThayDoi: new Date(),
      nguoiThucHien,
    };

    const updated = await this.hoKhauModel
      .findByIdAndUpdate(
        hoKhauId,
        { $push: { lichSuThayDoi: lichSu } },
        { new: true },
      )
      .exec();

    return updated ? this.toResponse(updated) : null;
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
  ): Promise<HoKhauResponse | null> {
    const updateData: {
      $set: Partial<UpdateHoKhauDto>;
      $push?: { lichSuThayDoi: LichSuThayDoiHoKhau };
    } = { $set: { ...updateHoKhauDto } };

    if (nguoiThucHien) {
      const lichSu: LichSuThayDoiHoKhau = {
        noiDung: updateHoKhauDto.ghiChu || 'Cập nhật thông tin hộ khẩu',
        ngayThayDoi: new Date(),
        nguoiThucHien,
      };
      updateData.$push = { lichSuThayDoi: lichSu };
    }

    const updated = await this.hoKhauModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    return updated ? this.toResponse(updated) : null;
  }

  async remove(id: string): Promise<HoKhau | null> {
    // Xóa hoKhauId khỏi tất cả nhân khẩu thuộc hộ này
    await this.nhanKhauModel.updateMany(
      { hoKhauId: new Types.ObjectId(id) },
      { $unset: { hoKhauId: 1, quanHeVoiChuHo: 1 } },
    );

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
  async getDanhSachHoKhauActive(): Promise<HoKhauResponse[]> {
    const hoKhauList = await this.hoKhauModel
      .find({ trangThai: 'Đang hoạt động' })
      .exec();
    return Promise.all(hoKhauList.map((hk) => this.toResponse(hk)));
  }
}
