import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { Public } from './common/decorators/public';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  checkServer(): string {
    return this.appService.checkServer();
  }

  @Public()
  @Get('health')
  checkServerSimple() {
    return this.appService.checkServerHealth();
  }

  @Get('/debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }

  @Get('.well-known/apple-app-site-association')
  getApple(@Res() res: Response) {
    const file = join(
      __dirname,
      '..',
      'public',
      '.well-known',
      'apple-app-site-association',
    );
    console.log(file);
    const data = fs.readFileSync(file, 'utf8');
    console.log(data);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.parse(data));
  }

  @Get('.well-known/assetlinks.json')
  getAssetLinks(@Res() res: Response) {
    const file = join(
      __dirname,
      '..',
      'public',
      '.well-known',
      'assetlinks.json',
    );
    const data = fs.readFileSync(file, 'utf8');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.parse(data));
  }

  @Get('nerobudget')
  appRedirect(@Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /iphone|ipad|ipod|android/i.test(userAgent);
    if (isMobile) {
      const isIos = /iphone|ipad|ipod/i.test(userAgent);
      const isAndroid = /android/i.test(userAgent);
      if (isIos) {
        return res.redirect('https://apps.apple.com/app/id6749315199');
      }
      if (isAndroid) {
        return res.redirect(
          'https://play.google.com/store/apps/details?id=ai.penningmeester.app',
        );
      }
    }
    return res.redirect('https://nerobudget.ai/en');
  }
  // @Public()
  // @Get('env')
  // getEnvironmentVariables(): Record<string, string> {
  //   const envVariables = { ...process.env };
  //   return envVariables;
  // }
}
