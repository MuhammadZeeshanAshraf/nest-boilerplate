import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    console.log('URL: ', req.url);
    console.log('BaseURL: ', req.baseUrl);
    console.log('OriginalURL: ', req.originalUrl);
    next();
  }
}
