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
import { CreateHoKhauDto } from './dto/create-ho-khau.dto';
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
} from '@nestjs/swagger';

@ApiTags('Hộ khẩu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ho-khau')
export class HoKhauController {
  constructor(private readonly hoKhauService: HoKhauService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo hộ khẩu mới' })
  create(@Body() createHoKhauDto: CreateHoKhauDto) {
    return this.hoKhauService.create(createHoKhauDto);
  }

  @Post('tach-ho')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Tách hộ từ hộ khẩu hiện có' })
  tachHo(
    @Body()
    data: {
      hoKhauGocId: string;
      maHoKhauMoi: string;
      chuHoMoi: { nhanKhauId: string; hoTen: string };
      diaChi: any;
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

  @Get('generate-ma')
  @ApiOperation({ summary: 'Tạo mã hộ khẩu tự động' })
  generateMa() {
    return this.hoKhauService.generateMaHoKhau();
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
