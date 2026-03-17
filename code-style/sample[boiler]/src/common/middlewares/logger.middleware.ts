import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '../../modules/user/entities/user/user.entity';
import dataSource from '../database/dbConfig';

@Injectable()
export class CurlLoggerMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let lang = null;
    const languageHeader = req.headers['lang'] || req.headers['Lang'];
    if (languageHeader) {
      req.headers['Lang'] = languageHeader;
      next();
      return;
    }
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      const token = authHeader.slice(7);
      try {
        const decoded = jwt.decode(token, { complete: true });
        if (decoded.payload) {
          const payload = JSON.parse(JSON.stringify(decoded.payload));
          const userId = payload.id || payload.userId;
          if (userId && userId > 0) {
            const user = await dataSource.getRepository(User).findOne({
              where: { id: userId },
              relations: { language: true },
            });
            if (user) {
              lang = lang || user?.language?.code || 'en';
              req.headers['Lang'] = lang;
              next();
              return;
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    const payload = JSON.parse(JSON.stringify(req.body) ?? '{}');
    if (payload) {
      lang = lang || payload?.lang || 'en';
      req.headers['Lang'] = lang;
    }

    // const method = req.method.toUpperCase();
    // const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // const headers = Object.entries(req.headers)
    //   .filter(([key]) => key.toLowerCase() !== 'host')
    //   .map(([key, value]) => `-H "${key}: ${value}"`)
    //   .join(' ');

    // let data = '';
    // if (req.body && Object.keys(req.body).length > 0) {
    //   try {
    //     data = `--data '${JSON.stringify(req.body)}'`;
    //   } catch (err) {
    //     data = `--data '${req.body}'`;
    //   }
    // }
    // const curlCommand = `curl -X ${method} ${headers} ${data} "${fullUrl}"`;
    // // console.log('\n', curlCommand, '\n');

    // const authHeader =
    //   req.headers['authorization'] || req.headers['Authorization'];
    // if (
    //   authHeader &&
    //   typeof authHeader === 'string' &&
    //   authHeader.startsWith('Bearer ')
    // ) {
    //   const token = authHeader.slice(7);
    //   try {
    //     const decoded = jwt.decode(token, { complete: true });
    //     // console.log(
    //     //   '🔐 Decoded Bearer Token:',
    //     //   JSON.stringify(decoded, null, 2),
    //     // );
    //   } catch (err) {
    //     // console.warn('⚠️ Failed to decode token:', err.message);
    //   }
    // }
    next();
  }
}
