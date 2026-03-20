import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AppInterceptor');
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv !== 'development') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const body = request.body as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;
    const params = request.params as Record<string, unknown>;

    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const now = Date.now();

    this.logger.debug(
      `🚀 Call: ${className} -> ${handlerName}\n` +
        `📥 Args: ${JSON.stringify({ params, query, body }, null, 2)}`,
    );

    return next.handle().pipe(
      tap((data: unknown) => {
        const delay = Date.now() - now;
        this.logger.debug(
          `✅ Finished: ${className} -> ${handlerName} (+${delay}ms)\n` +
            `📤 Result: ${JSON.stringify(data, null, 2)}`,
        );
      }),
    );
  }
}
