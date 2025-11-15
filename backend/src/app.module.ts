import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NhanKhauModule } from './nhan-khau/nhan-khau.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { HoKhauModule } from './ho-khau/ho-khau.module';

@Module({
  imports: [
    NhanKhauModule,

    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (cf: ConfigService) => {
        return {
          uri: cf.get<string>('MONGODB_URI'),
        };
      },
      inject: [ConfigService],
    }),
    RolesModule,
    AuthModule,
    HoKhauModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
