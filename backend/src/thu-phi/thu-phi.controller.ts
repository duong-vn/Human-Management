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
} from '@nestjs/swagger';

@ApiTags('Thu phí')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('thu-phi')
export class ThuPhiController {
  constructor(private readonly thuPhiService: ThuPhiService) {}

  @Post()
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({ summary: 'Tạo phiếu thu mới' })
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
  update(@Param('id') id: string, @Body() updateThuPhiDto: UpdateThuPhiDto) {
    return this.thuPhiService.update(id, updateThuPhiDto);
  }

  @Delete(':id')
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Xóa phiếu thu' })
  remove(@Param('id') id: string) {
    return this.thuPhiService.remove(id);
  }
}
