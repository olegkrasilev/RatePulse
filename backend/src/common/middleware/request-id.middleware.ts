import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingId = req.get('x-request-id');
    const requestId = existingId || randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}
