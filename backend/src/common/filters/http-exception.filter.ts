import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // this.logger.warn(
    //   {
    //     method: request.method,
    //     path: request.url,
    //     statusCode: status,
    //     response: exception.getResponse(),
    //     ip: request.ip,
    //     requestId: request.requestId,
    //     referer: request.get('referer'),
    //   },
    //   'HTTP Exception',
    // );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
