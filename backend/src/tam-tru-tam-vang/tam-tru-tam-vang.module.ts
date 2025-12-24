import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TamTruTamVangService } from './tam-tru-tam-vang.service';
import { TamTruTamVangController } from './tam-tru-tam-vang.controller';
import {
  TamTruTamVang,
  TamTruTamVangSchema,
} from './schemas/tam-tru-tam-vang.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TamTruTamVang.name, schema: TamTruTamVangSchema },
    ]),
  ],
  controllers: [TamTruTamVangController],
  providers: [TamTruTamVangService],
  exports: [TamTruTamVangService],
})
export class TamTruTamVangModule {}
