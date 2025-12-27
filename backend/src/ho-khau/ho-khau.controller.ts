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
import { HoKhauService } from './ho-khau.service';
import { CreateHoKhauDto, DiaChi } from './dto/create-ho-khau.dto';
import { UpdateHoKhauDto } from './dto/update-ho-khau.dto';
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

@ApiTags('Hộ khẩu')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ho-khau')
export class HoKhauController {
  constructor(private readonly hoKhauService: HoKhauService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hộ khẩu mới' })
  @ApiBody({
    schema: {
      example: {
        chuHo: {
          nhanKhauId: '694cb3d6ab52b519fd76b918',
          hoTen: 'Dương Tuấn Nguyễn',
        },
        diaChi: {
          soNha: '12',
          duong: 'Nguyễn Du',
          phuongXa: 'Phường Bến Nghé',
          quanHuyen: 'Quận 1',
          tinhThanh: 'TP. Hồ Chí Minh',
        },
        trangThai: 'Đang hoạt động',
        thanhVien: [
          {
            nhanKhauId: '694cb9093eeb3ec342ef4d0e',
            hoTen: 'vo cua Nguyễn Tuấn Dương',
            quanHeVoiChuHo: 'Vo',
          },
          {
            nhanKhauId: '694cbf831114476cbffaddd4',
            hoTen: 'con cua Nguyễn Tuấn Dương',
            quanHeVoiChuHo: 'Con',
          },
        ],
        ghiChu: 'Tạo hộ khẩu mới tháng 12/2025',
      },
    },
  })
  create(@Body() createHoKhauDto: CreateHoKhauDto) {
    return this.hoKhauService.create(createHoKhauDto);
  }

  @Post('tach-ho')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Tách hộ từ hộ khẩu hiện có' })
  @ApiBody({
    schema: {
      example: {
        hoKhauGocId: '694d441431735a5a0eac845a',
        chuHoMoi: {
          nhanKhauId: '694cbf831114476cbffaddd4',
          hoTen: 'con cau Nguyễn Tuan Duong',
        },
        diaChi: {
          soNha: '88',
          duong: 'Lý Tự Trọng',
          phuongXa: 'Phường 7',
          quanHuyen: 'Quận 3',
          tinhThanh: 'TP. Hồ Chí Minh',
        },
        danhSachNhanKhauId: [
          '694cb3d6ab52b519fd76b918',
          '6926c6af840b406838006a28',
        ],
      },
    },
  })
  tachHo(
    @Body()
    data: {
      hoKhauGocId: string;
      chuHoMoi: { nhanKhauId: string; hoTen: string };
      diaChi: DiaChi;
      danhSachNhanKhauId: string[];
    },
    @Request() req,
  ) {
    return this.hoKhauService.tachHo({
      ...data,
      nguoiThucHien: req.user.username,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hộ khẩu' })
  @ApiQuery({ name: 'trangThai', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('trangThai') trangThai?: string,
    @Query('search') search?: string,
  ) {
    return this.hoKhauService.findAll({ trangThai, search });
  }

  @Get('thong-ke')
  @ApiOperation({ summary: 'Thống kê hộ khẩu' })
  thongKe() {
    return this.hoKhauService.thongKe();
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách hộ khẩu đang hoạt động' })
  getActive() {
    return this.hoKhauService.getDanhSachHoKhauActive();
  }

  @Get('ma/:maHoKhau')
  @ApiOperation({ summary: 'Tìm hộ khẩu theo mã' })
  findByMa(@Param('maHoKhau') maHoKhau: string) {
    return this.hoKhauService.findByMaHoKhau(maHoKhau);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết hộ khẩu' })
  findOne(@Param('id') id: string) {
    return this.hoKhauService.findOne(id);
  }

  @Get(':id/lich-su')
  @ApiOperation({ summary: 'Lấy lịch sử thay đổi hộ khẩu' })
  getLichSu(@Param('id') id: string) {
    return this.hoKhauService.getLichSuThayDoi(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin hộ khẩu' })
  @ApiBody({
    schema: {
      example: {
        diaChi: {
          soNha: '15',
          duong: 'Nguyễn Trãi',
          phuongXa: 'Phường 1',
          quanHuyen: 'Quận 5',
          tinhThanh: 'TP. Hồ Chí Minh',
        },
        trangThai: 'Đang hoạt động',
        ghiChu: 'Cập nhật địa chỉ hộ khẩu',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateHoKhauDto: UpdateHoKhauDto,
    @Request() req,
  ) {
    return this.hoKhauService.update(id, updateHoKhauDto, req.user.username);
  }

  @Patch(':id/thay-doi-chu-ho')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Thay đổi chủ hộ' })
  @ApiBody({
    schema: {
      example: {
        chuHoMoiId: '691d9631baac1efb7579cf11',
        hoTenChuHoMoi: 'Nguyễn Tuấn Dương',
        lyDo: 'Chủ hộ cũ chuyển đi',
      },
    },
  })
  thayDoiChuHo(
    @Param('id') id: string,
    @Body()
    data: {
      chuHoMoiId: string;
      hoTenChuHoMoi: string;
      lyDo?: string;
    },
    @Request() req,
  ) {
    return this.hoKhauService.thayDoiChuHo(id, {
      ...data,
      nguoiThucHien: req.user.username,
    });
  }

  @Patch(':id/them-thanh-vien')
  @ApiOperation({ summary: 'Thêm thành viên vào hộ khẩu' })
  @ApiBody({
    schema: {
      example: {
        nhanKhauId: '691d9631baac1efb7579cf13',
        hoTen: 'Trần Minh Anh',
        quanHeVoiChuHo: 'Vợ',
      },
    },
  })
  themThanhVien(
    @Param('id') id: string,
    @Body() data: { nhanKhauId: string; hoTen: string; quanHeVoiChuHo: string },
    @Request() req,
  ) {
    return this.hoKhauService.themThanhVien(id, data, req.user.username);
  }

  @Patch(':id/xoa-thanh-vien/:nhanKhauId')
  @ApiOperation({ summary: 'Xóa thành viên khỏi hộ khẩu' })
  xoaThanhVien(
    @Param('id') id: string,
    @Param('nhanKhauId') nhanKhauId: string,
    @Request() req,
  ) {
    return this.hoKhauService.xoaThanhVien(id, nhanKhauId, req.user.username);
  }

  @Delete(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Xóa hộ khẩu' })
  remove(@Param('id') id: string) {
    return this.hoKhauService.remove(id);
  }
}
