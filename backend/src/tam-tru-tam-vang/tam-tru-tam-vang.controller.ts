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
import { TamTruTamVangService } from './tam-tru-tam-vang.service';
import { CreateTamTruTamVangDto } from './dto/create-tam-tru-tam-vang.dto';
import { UpdateTamTruTamVangDto } from './dto/update-tam-tru-tam-vang.dto';
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

@ApiTags('Tạm trú/Tạm vắng')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tam-tru-tam-vang')
export class TamTruTamVangController {
  constructor(private readonly tamTruTamVangService: TamTruTamVangService) {}

  @Post()
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Tạo giấy tạm trú/tạm vắng mới' })
  @ApiBody({
    description: 'Thông tin đăng ký tạm trú/tạm vắng',
    examples: {
      tamTru: {
        summary: 'Đăng ký tạm trú',
        description: 'Ví dụ đăng ký tạm trú cho nhân khẩu',
        value: {
          nhanKhauId: '6766a1234567890123456789',
          hoTen: 'Nguyễn Văn A',
          loai: 'Tạm trú',
          tuNgay: '2025-01-01',
          denNgay: '2025-06-30',
          diaChiTamTru: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
          diaChiThuongTru: '456 Trần Hưng Đạo, Phường 1, Quận 5, TP.HCM',
          lyDo: 'Đi làm việc',
          ghiChu: 'Đăng ký tạm trú 6 tháng',
        },
      },
      tamVang: {
        summary: 'Đăng ký tạm vắng',
        description: 'Ví dụ đăng ký tạm vắng cho nhân khẩu',
        value: {
          nhanKhauId: '6766a1234567890123456789',
          hoTen: 'Trần Thị B',
          loai: 'Tạm vắng',
          tuNgay: '2025-01-15',
          denNgay: '2025-03-15',
          diaChiThuongTru: '789 Nguyễn Huệ, Phường 1, Quận 1, TP.HCM',
          noiDen: 'Hà Nội',
          lyDo: 'Đi công tác',
          ghiChu: 'Công tác 2 tháng',
        },
      },
    },
  })
  create(@Body() createDto: CreateTamTruTamVangDto, @Request() req) {
    return this.tamTruTamVangService.create(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tạm trú/tạm vắng' })
  @ApiQuery({ name: 'loai', required: false, enum: ['Tạm trú', 'Tạm vắng'] })
  @ApiQuery({ name: 'trangThai', required: false })
  findAll(
    @Query('loai') loai?: string,
    @Query('trangThai') trangThai?: string,
    @Query('tuNgay') tuNgay?: string,
    @Query('denNgay') denNgay?: string,
  ) {
    return this.tamTruTamVangService.findAll({
      loai,
      trangThai,
      tuNgay: tuNgay ? new Date(tuNgay) : undefined,
      denNgay: denNgay ? new Date(denNgay) : undefined,
    });
  }

  @Get('thong-ke')
  @ApiOperation({ summary: 'Thống kê tạm trú/tạm vắng' })
  thongKe(
    @Query('tuNgay') tuNgay?: string,
    @Query('denNgay') denNgay?: string,
  ) {
    return this.tamTruTamVangService.thongKe(
      tuNgay ? new Date(tuNgay) : undefined,
      denNgay ? new Date(denNgay) : undefined,
    );
  }

  @Get('nhan-khau/:nhanKhauId')
  @ApiOperation({ summary: 'Lấy danh sách tạm trú/tạm vắng theo nhân khẩu' })
  findByNhanKhau(@Param('nhanKhauId') nhanKhauId: string) {
    return this.tamTruTamVangService.findByNhanKhau(nhanKhauId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một giấy tạm trú/tạm vắng' })
  findOne(@Param('id') id: string) {
    return this.tamTruTamVangService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Cập nhật giấy tạm trú/tạm vắng' })
  @ApiBody({
    description: 'Thông tin cập nhật tạm trú/tạm vắng',
    examples: {
      giaHan: {
        summary: 'Gia hạn thời gian',
        value: {
          denNgay: '2025-08-30',
          ghiChu: 'Gia hạn thêm 2 tháng',
        },
      },
      capNhatTrangThai: {
        summary: 'Cập nhật trạng thái',
        value: {
          trangThai: 'Hết hạn',
          ghiChu: 'Đã hết thời hạn tạm trú',
        },
      },
      huyDangKy: {
        summary: 'Hủy đăng ký',
        value: {
          trangThai: 'Đã hủy',
          ghiChu: 'Hủy theo yêu cầu của nhân khẩu',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateTamTruTamVangDto) {
    return this.tamTruTamVangService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Xóa giấy tạm trú/tạm vắng' })
  remove(@Param('id') id: string) {
    return this.tamTruTamVangService.remove(id);
  }
}
