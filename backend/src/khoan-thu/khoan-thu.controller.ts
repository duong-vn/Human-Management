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
} from '@nestjs/common';
import { KhoanThuService } from './khoan-thu.service';
import { CreateKhoanThuDto } from './dto/create-khoan-thu.dto';
import { UpdateKhoanThuDto } from './dto/update-khoan-thu.dto';
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

@ApiTags('Khoản thu')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('khoan-thu')
export class KhoanThuController {
  constructor(private readonly khoanThuService: KhoanThuService) {}

  @Post()
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({ summary: 'Tạo khoản thu mới' })
  @ApiBody({
    description: 'Thông tin khoản thu mới',
    examples: {
      phiBatBuocTheoNhanKhau: {
        summary: 'Phí bắt buộc theo nhân khẩu',
        description: 'Ví dụ: Phí vệ sinh 6000đ/người/tháng',
        value: {
          tenKhoanThu: 'Phí vệ sinh',
          loaiKhoanThu: 'Bắt buộc',
          moTa: 'Phí vệ sinh môi trường hàng tháng',
          soTien: 6000,
          donViTinh: 'VNĐ/người/tháng',
          ngayBatDau: '2025-01-01',
          isActive: true,
          ghiChu: 'Thu theo số nhân khẩu trong hộ',
        },
      },
      phiBatBuocTheoDienTich: {
        summary: 'Phí bắt buộc theo diện tích',
        description: 'Ví dụ: Phí dịch vụ chung cư',
        value: {
          tenKhoanThu: 'Phí dịch vụ chung cư',
          loaiKhoanThu: 'Bắt buộc',
          moTa: 'Phí dịch vụ quản lý chung cư hàng tháng',
          soTien: 6000,
          donViTinh: 'VNĐ/m2/tháng',
          ngayBatDau: '2025-01-01',
          isActive: true,
          ghiChu: 'Thu theo diện tích căn hộ',
        },
      },
      dongGopTuNguyen: {
        summary: 'Đóng góp tự nguyện',
        description: 'Ví dụ: Quỹ khuyến học',
        value: {
          tenKhoanThu: 'Quỹ khuyến học',
          loaiKhoanThu: 'Tự nguyện',
          moTa: 'Đóng góp quỹ khuyến học năm 2025',
          ngayBatDau: '2025-01-01',
          ngayKetThuc: '2025-12-31',
          isActive: true,
          tenDotThu: 'Quỹ khuyến học năm học 2024-2025',
          ghiChu: 'Tự nguyện đóng góp, không bắt buộc',
        },
      },
      dotDongGopDacBiet: {
        summary: 'Đợt đóng góp đặc biệt',
        description: 'Ví dụ: Ủng hộ đồng bào lũ lụt',
        value: {
          tenKhoanThu: 'Ủng hộ đồng bào lũ lụt',
          loaiKhoanThu: 'Tự nguyện',
          moTa: 'Quyên góp ủng hộ đồng bào miền Trung',
          ngayBatDau: '2025-01-15',
          ngayKetThuc: '2025-02-15',
          isActive: true,
          tenDotThu: 'Đợt quyên góp tháng 1/2025',
          ghiChu: 'Đóng góp tùy tâm',
        },
      },
    },
  })
  create(@Body() createKhoanThuDto: CreateKhoanThuDto) {
    return this.khoanThuService.create(createKhoanThuDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khoản thu' })
  @ApiQuery({
    name: 'loaiKhoanThu',
    required: false,
    enum: ['Bắt buộc', 'Tự nguyện'],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('loaiKhoanThu') loaiKhoanThu?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.khoanThuService.findAll({
      loaiKhoanThu,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('bat-buoc')
  @ApiOperation({ summary: 'Lấy danh sách khoản thu bắt buộc' })
  findBatBuoc() {
    return this.khoanThuService.findBatBuoc();
  }

  @Get('tu-nguyen')
  @ApiOperation({ summary: 'Lấy danh sách khoản đóng góp tự nguyện' })
  findTuNguyen() {
    return this.khoanThuService.findTuNguyen();
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách khoản thu đang hoạt động' })
  findActive() {
    return this.khoanThuService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một khoản thu' })
  findOne(@Param('id') id: string) {
    return this.khoanThuService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({ summary: 'Cập nhật khoản thu' })
  @ApiBody({
    description: 'Thông tin cập nhật khoản thu',
    examples: {
      capNhatSoTien: {
        summary: 'Cập nhật số tiền',
        value: {
          soTien: 7000,
          ghiChu: 'Điều chỉnh tăng từ 6000đ lên 7000đ',
        },
      },
      ketThucKhoanThu: {
        summary: 'Kết thúc khoản thu',
        value: {
          ngayKetThuc: '2025-12-31',
          isActive: false,
          ghiChu: 'Đã kết thúc đợt thu',
        },
      },
      kichHoatLai: {
        summary: 'Kích hoạt lại khoản thu',
        value: {
          isActive: true,
          ngayKetThuc: '2026-12-31',
          ghiChu: 'Gia hạn thêm 1 năm',
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateKhoanThuDto: UpdateKhoanThuDto,
  ) {
    return this.khoanThuService.update(id, updateKhoanThuDto);
  }

  @Delete(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Xóa khoản thu' })
  remove(@Param('id') id: string) {
    return this.khoanThuService.remove(id);
  }
}
