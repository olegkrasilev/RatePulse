import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { UserAlreadyExistsError } from '../../modules/user/errors/user-already-exists.error';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchEverythingFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    // 1. Обработка типов исключений без использования any
    if (exception instanceof UserAlreadyExistsError) {
      httpStatus = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const res = exception.getResponse();
      // Безопасно достаем message из объекта ответа NestJS
      message =
        typeof res === 'object' && res !== null && 'message' in res
          ? ((res as Record<string, unknown>).message as string | object)
          : exception.message;
    } else if (exception instanceof Error) {
      // Для обычных ошибок берем их сообщение
      message = exception.message;
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      message,
    };

    // 2. Логирование (убираем небезопасные присваивания)
    const exceptionName =
      exception instanceof Error ? exception.name : 'UnknownError';

    if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          method: request.method,
          path: request.url,
          body: request.body as Record<string, unknown>,
          query: request.query,
          exceptionName,
          message:
            exception instanceof Error ? exception.message : String(exception),
        },
        exception instanceof Error ? exception.stack : 'No stack',
        'UnexpectedSystemError',
      );
    } else {
      this.logger.warn(
        `⚠️ [${request.method}] ${request.url} | Status: ${httpStatus} | ${exceptionName}: ${JSON.stringify(message)}`,
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
