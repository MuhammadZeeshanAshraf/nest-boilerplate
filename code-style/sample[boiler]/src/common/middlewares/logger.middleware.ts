import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CurlLoggerMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const method = req.method.toUpperCase();
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const headers = Object.entries(req.headers)
      .filter(([key]) => key.toLowerCase() !== 'host')
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' ');

    let data = '';
    if (req.body && Object.keys(req.body).length > 0) {
      try {
        data = `--data '${JSON.stringify(req.body)}'`;
      } catch (err) {
        data = `--data '${req.body}'`;
      }
    }
    const curlCommand = `curl -X ${method} ${headers} ${data} "${fullUrl}"`;
    console.info('\n', curlCommand, '\n');

    next();
  }
}
