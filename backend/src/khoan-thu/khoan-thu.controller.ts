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
} from '@nestjs/swagger';

@ApiTags('Khoản thu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('khoan-thu')
export class KhoanThuController {
  constructor(private readonly khoanThuService: KhoanThuService) {}

  @Post()
  @Roles(UserRole.TO_TRUONG, UserRole.TO_PHO, UserRole.KE_TOAN)
  @ApiOperation({ summary: 'Tạo khoản thu mới' })
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
