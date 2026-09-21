import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NhanKhauModule } from './nhan-khau/nhan-khau.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { HoKhauModule } from './ho-khau/ho-khau.module';
import { TamTruTamVangModule } from './tam-tru-tam-vang/tam-tru-tam-vang.module';
import { UsersModule } from './users/users.module';
import { KhoanThuModule } from './khoan-thu/khoan-thu.module';
import { ThuPhiModule } from './thu-phi/thu-phi.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
        '.env.local',
      ],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (cf: ConfigService) => {
        const uri = cf.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    NhanKhauModule,
    HoKhauModule,
    TamTruTamVangModule,
    KhoanThuModule,
    ThuPhiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
