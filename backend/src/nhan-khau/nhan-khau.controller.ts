import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { NhanKhauService } from './nhan-khau.service';
import { CreateNhanKhauDto } from './dto/create-nhan-khau.dto';
import { UpdateNhanKhauDto } from './dto/update-nhan-khau.dto';

@Controller('nhan-khau')
export class NhanKhauController {
  constructor(private readonly nhanKhauService: NhanKhauService) {}

  @Post()
  create(@Body() createNhanKhauDto: CreateNhanKhauDto) {
    return this.nhanKhauService.create(createNhanKhauDto);
  }

  @Get()
  findAll(@Query('hoKhauId') hoKhauId?: string) {
    if (hoKhauId) {
      return this.nhanKhauService.findByHoKhau(hoKhauId);
    }
    return this.nhanKhauService.findAll();
  }

  @Get('cccd/:cccd')
  findByCCCD(@Param('cccd') cccd: string) {
    return this.nhanKhauService.findByCCCD(cccd);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nhanKhauService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNhanKhauDto: UpdateNhanKhauDto,
  ) {
    return this.nhanKhauService.update(id, updateNhanKhauDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nhanKhauService.remove(id);
  }
}
