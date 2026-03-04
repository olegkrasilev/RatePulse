import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingId = req.get('x-request-id');
    const requestId = existingId || uuidv4();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}
