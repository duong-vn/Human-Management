import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KhoanThuService } from './khoan-thu.service';
import { KhoanThuController } from './khoan-thu.controller';
import { KhoanThu, KhoanThuSchema } from './schemas/khoan-thu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhoanThu.name, schema: KhoanThuSchema },
    ]),
  ],
  controllers: [KhoanThuController],
  providers: [KhoanThuService],
  exports: [KhoanThuService],
})
export class KhoanThuModule {}
