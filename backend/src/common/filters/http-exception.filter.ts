import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { isDevelopment, isProduction } from '../constants/env';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  constructor() {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.warn(
      {
        method: request.method,
        path: request.url,
        statusCode: status,
        response: exception.getResponse(),
        ip: request.ip,
        requestId: request.requestId,
        referer: request.get('referer'),
      },
      'HTTP Exception',
    );

    if (isDevelopment) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        stack: exception instanceof Error ? exception.stack : null,
        requestId: request.requestId,
      });
    }

    if (isProduction) {
      response.status(status).json({
        statusCode: status,
      });
    }
  }
}
