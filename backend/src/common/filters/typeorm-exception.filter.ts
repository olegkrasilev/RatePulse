import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';
import { isDevelopment, isProduction } from '../constants/env';

interface PostgresDriverError {
  code: string;
  constraint?: string;
  column?: string;
  detail?: string;
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const driverError = exception.driverError as unknown as PostgresDriverError;
    const pgErrorCode = driverError.code;
    let errorMessage = 'An unexpected database error occurred.';
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (pgErrorCode) {
      case '23505':
        errorMessage = `Duplicate entry for constraint: ${driverError.constraint || 'unknown'}`;
        httpStatus = HttpStatus.CONFLICT;
        break;
      case '23503':
        errorMessage = `Foreign key violation: ${driverError.constraint || 'unknown'}`;
        httpStatus = HttpStatus.BAD_REQUEST;
        break;
      case '23502':
        errorMessage = `Missing required value for column: ${driverError.column || 'unknown'}`;
        httpStatus = HttpStatus.BAD_REQUEST;
        break;
      default:
        this.logger.error(
          {
            code: pgErrorCode,
            detail: driverError.detail,
            query: exception.query,
          },
          'Unhandled Database Error',
        );
    }

    if (isDevelopment) {
      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
        stack: exception instanceof Error ? exception.stack : null,
        requestId: request.requestId,
      });
    }

    if (isProduction) {
      response.status(httpStatus).json({
        statusCode: httpStatus,
      });
    }
  }
}
