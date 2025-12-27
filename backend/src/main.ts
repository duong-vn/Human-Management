import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Quản lý Tổ dân phố API')
    .setDescription(
      'API Backend cho hệ thống quản lý thông tin tổ dân phố 7 - Phường La Khê',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    )
    .addTag('Auth', 'Xác thực người dùng')
    .addTag('Nhân khẩu', 'Quản lý thông tin nhân khẩu')
    .addTag('Hộ khẩu', 'Quản lý thông tin hộ khẩu')
    .addTag('Tạm trú/Tạm vắng', 'Quản lý tạm trú tạm vắng')
    .addTag('Khoản thu', 'Quản lý các khoản thu')
    .addTag('Thu phí', 'Quản lý thu phí và đóng góp')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    credentials: true,
  });
  const port = configService.get<string>('PORT') ?? 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

void bootstrap();
