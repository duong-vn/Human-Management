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
import { NhanKhauService } from './nhan-khau.service';
import { CreateNhanKhauDto } from './dto/create-nhan-khau.dto';
import { UpdateNhanKhauDto } from './dto/update-nhan-khau.dto';
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

@ApiTags('Nhân khẩu')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nhan-khau')
export class NhanKhauController {
  constructor(private readonly nhanKhauService: NhanKhauService) { }

  @Post()
  @ApiOperation({ summary: 'Thêm nhân khẩu mới' })
  create(@Body() createNhanKhauDto: CreateNhanKhauDto) {
    return this.nhanKhauService.create(createNhanKhauDto);
  }

  @Post('moi-sinh')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.CAN_BO)
  @ApiOperation({ summary: 'Thêm nhân khẩu mới sinh' })
  themMoiSinh(
    @Body()
    data: {
      hoTen: string;
      ngaySinh: Date;
      gioiTinh: string;
      hoKhauId: string;
      quanHeVoiChuHo: string;
    },
    @Request() req,
  ) {
    return this.nhanKhauService.themMoiSinh({
      ...data,
      nguoiThucHien: req.user.username,
    });
  }

  @Patch(':id/chuyen-di')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.CAN_BO)
  @ApiOperation({ summary: 'Đánh dấu nhân khẩu chuyển đi' })
  chuyenDi(
    @Param('id') id: string,
    @Body()
    data: {
      ngayChuyenDi: Date;
      noiChuyenDen: string;
      lyDoChuyenDi?: string;
    },
    @Request() req,
  ) {
    return this.nhanKhauService.chuyenDi(id, {
      ...data,
      nguoiThucHien: req.user.username,
    });
  }

  @Patch(':id/qua-doi')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.CAN_BO)
  @ApiOperation({ summary: 'Đánh dấu nhân khẩu qua đời' })
  quaDoi(
    @Param('id') id: string,
    @Body() data: { ngayMat: Date },
    @Request() req,
  ) {
    return this.nhanKhauService.quaDoi(id, {
      ngayMat: data.ngayMat,
      nguoiThucHien: req.user.username,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhân khẩu' })
  @ApiQuery({ name: 'hoKhauId', required: false })
  @ApiQuery({ name: 'trangThai', required: false })
  @ApiQuery({ name: 'gioiTinh', required: false })
  findAll(
    @Query('hoKhauId') hoKhauId?: string,
    @Query('trangThai') trangThai?: string,
    @Query('gioiTinh') gioiTinh?: string,
  ) {
    return this.nhanKhauService.findAll({ hoKhauId, trangThai, gioiTinh });
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm nhân khẩu' })
  @ApiQuery({ name: 'keyword', required: true })
  search(@Query('keyword') keyword: string) {
    return this.nhanKhauService.search(keyword);
  }

  @Get('thong-ke/gioi-tinh')
  @ApiOperation({ summary: 'Thống kê nhân khẩu theo giới tính' })
  thongKeTheoGioiTinh() {
    return this.nhanKhauService.thongKeTheoGioiTinh();
  }

  @Get('thong-ke/do-tuoi')
  @ApiOperation({ summary: 'Thống kê nhân khẩu theo độ tuổi' })
  thongKeTheoDoTuoi() {
    return this.nhanKhauService.thongKeTheoDoTuoi();
  }

  @Get('thong-ke/tong-quan')
  @ApiOperation({ summary: 'Thống kê tổng quan nhân khẩu' })
  thongKeTongQuan() {
    return this.nhanKhauService.thongKeTongQuan();
  }

  @Get('ho-khau/:hoKhauId')
  @ApiOperation({ summary: 'Lấy danh sách nhân khẩu theo hộ khẩu' })
  findByHoKhau(@Param('hoKhauId') hoKhauId: string) {
    return this.nhanKhauService.findByHoKhau(hoKhauId);
  }

  @Get('ho-khau/:hoKhauId/count')
  @ApiOperation({ summary: 'Đếm số nhân khẩu trong hộ khẩu' })
  demNhanKhau(@Param('hoKhauId') hoKhauId: string) {
    return this.nhanKhauService.demNhanKhauTheoHoKhau(hoKhauId);
  }

  @Get('cccd/:cccd')
  @ApiOperation({ summary: 'Tìm nhân khẩu theo CCCD' })
  findByCCCD(@Param('cccd') cccd: string) {
    return this.nhanKhauService.findByCCCD(cccd);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết nhân khẩu' })
  findOne(@Param('id') id: string) {
    return this.nhanKhauService.findOne(id);
  }

  @Get(':id/lich-su')
  @ApiOperation({ summary: 'Lấy lịch sử thay đổi của nhân khẩu' })
  getLichSu(@Param('id') id: string) {
    return this.nhanKhauService.getLichSuThayDoi(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhân khẩu' })
  update(
    @Param('id') id: string,
    @Body() updateNhanKhauDto: UpdateNhanKhauDto,
    @Request() req,
  ) {
    return this.nhanKhauService.update(
      id,
      updateNhanKhauDto,
      req.user.username,
    );
  }

  @Delete(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Xóa nhân khẩu' })
  remove(@Param('id') id: string) {
    return this.nhanKhauService.remove(id);
  }
}
