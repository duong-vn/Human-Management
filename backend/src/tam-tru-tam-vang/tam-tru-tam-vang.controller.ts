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
} from '@nestjs/swagger';

@ApiTags('Tạm trú/Tạm vắng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tam-tru-tam-vang')
export class TamTruTamVangController {
  constructor(private readonly tamTruTamVangService: TamTruTamVangService) {}

  @Post()
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO)
  @ApiOperation({ summary: 'Tạo giấy tạm trú/tạm vắng mới' })
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
