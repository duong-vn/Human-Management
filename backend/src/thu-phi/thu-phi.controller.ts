import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ThuPhiService } from './thu-phi.service';
import { CreateThuPhiDto } from './dto/create-thu-phi.dto';
import { UpdateThuPhiDto } from './dto/update-thu-phi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Thu phí')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('thu-phi')
export class ThuPhiController {
  constructor(private readonly thuPhiService: ThuPhiService) { }

  @Post()
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({ summary: 'Tạo phiếu thu mới' })
  @ApiBody({
    description: 'Thông tin phiếu thu mới',
    examples: {
      phieuThuDonGian: {
        summary: 'Phiếu thu đơn giản (1 khoản)',
        description: 'Ví dụ thu phí vệ sinh cho 1 hộ',
        value: {
          maPhieuThu: 'PT-2025-001',
          hoKhauId: '6766b1234567890123456789',
          tenChuHo: 'Nguyễn Văn A',
          diaChi: 'Căn hộ A-1201, Chung cư BlueMoon',
          soNhanKhau: 4,
          chiTietThu: [
            {
              khoanThuId: '6766c1234567890123456789',
              tenKhoanThu: 'Phí vệ sinh tháng 1/2025',
              soTien: 24000,
              ghiChu: '4 người x 6000đ',
            },
          ],
          tongTien: 24000,
          ngayThu: '2025-01-15',
          trangThai: 'Đã thu',
          nam: 2025,
          kyThu: 'Tháng 1/2025',
          ghiChu: 'Thu đủ',
        },
      },
      phieuThuNhieuKhoan: {
        summary: 'Phiếu thu nhiều khoản',
        description: 'Ví dụ thu nhiều loại phí cùng lúc',
        value: {
          maPhieuThu: 'PT-2025-002',
          hoKhauId: '6766b1234567890123456789',
          tenChuHo: 'Trần Thị B',
          diaChi: 'Căn hộ B-0503, Chung cư BlueMoon',
          soNhanKhau: 3,
          chiTietThu: [
            {
              khoanThuId: '6766c1111111111111111111',
              tenKhoanThu: 'Phí vệ sinh tháng 1/2025',
              soTien: 18000,
              ghiChu: '3 người x 6000đ',
            },
            {
              khoanThuId: '6766c2222222222222222222',
              tenKhoanThu: 'Phí dịch vụ tháng 1/2025',
              soTien: 450000,
              ghiChu: '75m2 x 6000đ',
            },
            {
              khoanThuId: '6766c3333333333333333333',
              tenKhoanThu: 'Quỹ khuyến học',
              soTien: 200000,
              ghiChu: 'Đóng góp tự nguyện',
            },
          ],
          tongTien: 668000,
          ngayThu: '2025-01-20',
          trangThai: 'Đã thu',
          nam: 2025,
          kyThu: 'Tháng 1/2025',
          ghiChu: 'Thu đầy đủ các khoản',
        },
      },
      phieuThuChuaThanhToan: {
        summary: 'Phiếu thu chưa thanh toán',
        description: 'Ghi nhận khoản phải thu (nợ)',
        value: {
          maPhieuThu: 'PT-2025-003',
          hoKhauId: '6766b9999999999999999999',
          tenChuHo: 'Lê Văn C',
          diaChi: 'Căn hộ C-0801, Chung cư BlueMoon',
          soNhanKhau: 2,
          chiTietThu: [
            {
              khoanThuId: '6766c1111111111111111111',
              tenKhoanThu: 'Phí vệ sinh tháng 1/2025',
              soTien: 12000,
              ghiChu: '2 người x 6000đ',
            },
          ],
          tongTien: 12000,
          ngayThu: '2025-01-25',
          trangThai: 'Chưa thu',
          nam: 2025,
          kyThu: 'Tháng 1/2025',
          ghiChu: 'Chủ hộ đi công tác, hẹn thu sau',
        },
      },
    },
  })
  create(@Body() createThuPhiDto: CreateThuPhiDto, @Request() req) {
    return this.thuPhiService.create(createThuPhiDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phiếu thu' })
  @ApiQuery({ name: 'hoKhauId', required: false })
  @ApiQuery({ name: 'nam', required: false, type: Number })
  @ApiQuery({
    name: 'trangThai',
    required: false,
    enum: ['Đã thu', 'Chưa thu', 'Đang nợ'],
  })
  @ApiQuery({ name: 'khoanThuId', required: false })
  @ApiQuery({ name: 'kyThu', required: false })
  findAll(
    @Query('hoKhauId') hoKhauId?: string,
    @Query('nam') nam?: string,
    @Query('trangThai') trangThai?: string,
    @Query('khoanThuId') khoanThuId?: string,
    @Query('kyThu') kyThu?: string,
  ) {
    return this.thuPhiService.findAll({
      hoKhauId,
      nam: nam ? parseInt(nam) : undefined,
      trangThai,
      khoanThuId,
      kyThu,
    });
  }

  @Get('thong-ke/nam/:nam')
  @ApiOperation({ summary: 'Thống kê thu phí theo năm' })
  thongKeTheoNam(@Param('nam') nam: string) {
    return this.thuPhiService.thongKeTheoNam(parseInt(nam));
  }

  @Get('thong-ke/chi-tiet/:nam')
  @ApiOperation({ summary: 'Thống kê chi tiết từng khoản thu trong năm' })
  thongKeChiTiet(@Param('nam') nam: string) {
    return this.thuPhiService.thongKeChiTietTheoNam(parseInt(nam));
  }

  @Get('thong-ke/khoan-thu/:khoanThuId')
  @ApiOperation({ summary: 'Thống kê theo khoản thu cụ thể' })
  @ApiQuery({ name: 'nam', required: false, type: Number })
  thongKeTheoKhoanThu(
    @Param('khoanThuId') khoanThuId: string,
    @Query('nam') nam?: string,
  ) {
    return this.thuPhiService.thongKeTheoKhoanThu(
      khoanThuId,
      nam ? parseInt(nam) : undefined,
    );
  }

  @Get('generate-ma/:nam')
  @ApiOperation({ summary: 'Tạo mã phiếu thu tự động' })
  generateMaPhieuThu(@Param('nam') nam: string) {
    return this.thuPhiService.generateMaPhieuThu(parseInt(nam));
  }

  @Get('ho-khau/:hoKhauId')
  @ApiOperation({ summary: 'Lấy danh sách phiếu thu theo hộ khẩu' })
  findByHoKhau(@Param('hoKhauId') hoKhauId: string) {
    return this.thuPhiService.findByHoKhau(hoKhauId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một phiếu thu' })
  findOne(@Param('id') id: string) {
    return this.thuPhiService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({ summary: 'Cập nhật phiếu thu' })
  @ApiBody({
    description: 'Thông tin cập nhật phiếu thu',
    examples: {
      xacNhanThanhToan: {
        summary: 'Xác nhận đã thanh toán',
        value: {
          trangThai: 'Đã thu',
          ngayThu: '2025-01-28',
          ghiChu: 'Đã thanh toán đầy đủ',
        },
      },
      ghiNhanNo: {
        summary: 'Ghi nhận còn nợ',
        value: {
          trangThai: 'Đang nợ',
          ghiChu: 'Chủ hộ hẹn thanh toán vào tháng sau',
        },
      },
      capNhatSoTien: {
        summary: 'Cập nhật số tiền',
        value: {
          chiTietThu: [
            {
              khoanThuId: '6766c1111111111111111111',
              tenKhoanThu: 'Phí vệ sinh tháng 1/2025',
              soTien: 30000,
              ghiChu: '5 người x 6000đ (thêm 1 nhân khẩu)',
            },
          ],
          tongTien: 30000,
          ghiChu: 'Cập nhật theo số nhân khẩu mới',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateThuPhiDto: UpdateThuPhiDto) {
    return this.thuPhiService.update(id, updateThuPhiDto);
  }

  @Delete(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Xóa phiếu thu' })
  remove(@Param('id') id: string) {
    return this.thuPhiService.remove(id);
  }

  // ====== API THỐNG KÊ CHO CÁN BỘ KẾ TOÁN ======

  @Get('ke-toan/tong-quan/:nam')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({
    summary: 'Thống kê tổng quan cho kế toán',
    description:
      'Lấy thống kê tổng số tiền đã thu, chưa thu, đang nợ, phân theo tháng và theo khoản thu',
  })
  thongKeTongQuan(@Param('nam') nam: string) {
    return this.thuPhiService.thongKeTongQuan(parseInt(nam));
  }

  @Get('ke-toan/dot-thu/nam/:nam')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({
    summary: 'Danh sách các đợt thu trong năm',
    description:
      'Lấy danh sách các đợt thu (kỳ thu) với tổng tiền và số hộ đã nộp',
  })
  getDanhSachDotThu(@Param('nam') nam: string) {
    return this.thuPhiService.getDanhSachDotThu(parseInt(nam));
  }

  @Get('ke-toan/dot-thu/:kyThu/thong-ke')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({
    summary: 'Thống kê theo đợt thu cụ thể',
    description: 'Lấy tổng tiền và số hộ đã nộp trong một đợt thu',
  })
  @ApiQuery({ name: 'nam', required: false, type: Number })
  thongKeTheoDotThu(
    @Param('kyThu') kyThu: string,
    @Query('nam') nam?: string,
  ) {
    return this.thuPhiService.thongKeTheoDotThu(
      decodeURIComponent(kyThu),
      nam ? parseInt(nam) : undefined,
    );
  }

  @Get('ke-toan/dot-thu/:kyThu/da-nop')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({
    summary: 'Chi tiết các hộ đã nộp trong đợt thu',
    description:
      'Lấy danh sách chi tiết từng hộ đã nộp tiền, bao gồm các khoản đã nộp',
  })
  @ApiQuery({ name: 'nam', required: false, type: Number })
  getChiTietHoDaNop(
    @Param('kyThu') kyThu: string,
    @Query('nam') nam?: string,
  ) {
    return this.thuPhiService.getChiTietHoDaNopTheoDot(
      decodeURIComponent(kyThu),
      nam ? parseInt(nam) : undefined,
    );
  }

  @Get('ke-toan/dot-thu/:kyThu/chua-nop')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({
    summary: 'Chi tiết các hộ chưa nộp trong đợt thu',
    description: 'Lấy danh sách các hộ chưa nộp hoặc đang nợ trong đợt thu',
  })
  @ApiQuery({ name: 'nam', required: false, type: Number })
  getChiTietHoChuaNop(
    @Param('kyThu') kyThu: string,
    @Query('nam') nam?: string,
  ) {
    return this.thuPhiService.getChiTietHoChuaNopTheoDot(
      decodeURIComponent(kyThu),
      nam ? parseInt(nam) : undefined,
    );
  }

  @Get('ke-toan/ho-khau/:hoKhauId/lich-su')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({
    summary: 'Lịch sử nộp tiền của một hộ khẩu',
    description:
      'Xem chi tiết tất cả các khoản tiền mà hộ đã nộp, tổng đã nộp và còn nợ',
  })
  @ApiQuery({ name: 'nam', required: false, type: Number })
  getLichSuNopTien(
    @Param('hoKhauId') hoKhauId: string,
    @Query('nam') nam?: string,
  ) {
    return this.thuPhiService.getLichSuNopTien(
      hoKhauId,
      nam ? parseInt(nam) : undefined,
    );
  }
}
