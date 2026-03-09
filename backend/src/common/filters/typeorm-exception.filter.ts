import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface PostgresDriverError {
  code: string;
  constraint?: string;
  column?: string;
  detail?: string;
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

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

    response.status(httpStatus).json({
      statusCode: httpStatus,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
