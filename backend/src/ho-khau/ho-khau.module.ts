import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HoKhauService } from './ho-khau.service';
import { HoKhauController } from './ho-khau.controller';
import { HoKhau, HoKhauSchema } from './schemas/ho-khau.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HoKhau.name, schema: HoKhauSchema }]),
  ],
  controllers: [HoKhauController],
  providers: [HoKhauService],
  exports: [HoKhauService],
})
export class HoKhauModule {}
