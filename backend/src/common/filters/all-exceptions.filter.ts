import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

interface MongoDuplicateKeyError {
  code: number;
  keyPattern?: Record<string, number | string>;
  keyValue?: Record<string, unknown>;
}

interface MongooseCastError {
  name: string;
  path?: string;
  value?: unknown;
}

interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
}

function isMongoDuplicateKeyError(
  error: unknown,
): error is MongoDuplicateKeyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 11000
  );
}

function isMongooseCastError(error: unknown): error is MongooseCastError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: unknown }).name === 'CastError'
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProd =
      this.configService.get<string>('NODE_ENV') === 'production';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Lỗi máy chủ nội bộ';
    let errorName: string | undefined = undefined;

    if (isMongoDuplicateKeyError(exception)) {
      statusCode = HttpStatus.CONFLICT;
      const keyPattern = exception.keyPattern;
      const keyValue = exception.keyValue;
      const field = keyPattern
        ? Object.keys(keyPattern)[0]
        : keyValue
          ? Object.keys(keyValue)[0]
          : 'Dữ liệu';
      message = `Trường ${field} đã tồn tại trong hệ thống`;
      errorName = 'Conflict';
    } else if (isMongooseCastError(exception)) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'ID không đúng định dạng MongoDB ObjectId';
      errorName = 'Bad Request';
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        if ('message' in resObj) {
          message = resObj.message as string | string[];
        }
        if ('error' in resObj && typeof resObj.error === 'string') {
          errorName = resObj.error;
        }
      }
    } else {
      if (!isProd && exception instanceof Error) {
        message = exception.message;
      }
      this.logger.error(
        `Unhandled Exception: ${
          exception instanceof Error ? exception.stack : String(exception)
        }`,
      );
    }

    const responseBody: ErrorResponseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(errorName ? { error: errorName } : {}),
    };

    response.status(statusCode).json(responseBody);
  }
}
