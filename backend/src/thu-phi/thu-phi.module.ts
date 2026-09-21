import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThuPhiService } from './thu-phi.service';
import { ThuPhiController } from './thu-phi.controller';
import { ThuPhi, ThuPhiSchema } from './schemas/thu-phi.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ThuPhi.name, schema: ThuPhiSchema }]),
  ],
  controllers: [ThuPhiController],
  providers: [ThuPhiService],
  exports: [ThuPhiService],
})
export class ThuPhiModule {}
