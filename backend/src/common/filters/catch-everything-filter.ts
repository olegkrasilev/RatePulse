import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const request = ctx.getRequest<Request>();
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    };

    this.logger.error(
      {
        method: request.method,
        path: request.url,
        body: request.body as unknown,
        requestId: request.requestId,
        query: request.query,
        params: request.params,
        exceptionName:
          exception instanceof Error ? exception.name : 'UnknownError',
        message: exception instanceof Error ? exception.message : exception,
      },
      exception instanceof Error ? exception.stack : 'No stack trace provided',
      'UnexpectedSystemError',
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
