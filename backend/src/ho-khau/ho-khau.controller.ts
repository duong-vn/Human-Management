import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HoKhauService } from './ho-khau.service';
import { CreateHoKhauDto } from './dto/create-ho-khau.dto';
import { UpdateHoKhauDto } from './dto/update-ho-khau.dto';

@Controller('ho-khau')
export class HoKhauController {
  constructor(private readonly hoKhauService: HoKhauService) {}

  @Post()
  create(@Body() createHoKhauDto: CreateHoKhauDto) {
    return this.hoKhauService.create(createHoKhauDto);
  }

  @Get()
  findAll() {
    return this.hoKhauService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hoKhauService.findOne(id);
  }

  @Get('ma/:maHoKhau')
  findByMaHoKhau(@Param('maHoKhau') maHoKhau: string) {
    return this.hoKhauService.findByMaHoKhau(maHoKhau);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHoKhauDto: UpdateHoKhauDto) {
    return this.hoKhauService.update(id, updateHoKhauDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hoKhauService.remove(id);
  }
}
