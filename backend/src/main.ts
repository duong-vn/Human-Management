import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  app.useGlobalFilters(new AllExceptionsFilter(configService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const enableSwagger =
    configService.get<string>('ENABLE_SWAGGER') === 'true' || !isProd;

  if (enableSwagger) {
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
  }

  app.use(cookieParser());

  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((o) => o.trim())
    : isProd
      ? false
      : true;

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    credentials: true,
  });

  const port = configService.get<string>('PORT') ?? 8080;
  await app.listen(port);
  logger.log(`Application is running on port: ${port}`);
  if (enableSwagger) {
    logger.log(`Swagger docs available at: http://localhost:${port}/docs`);
  }
}

void bootstrap();
