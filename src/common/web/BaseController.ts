import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JWT, NODE_ENV } from '../constants';
import { ResponseFactory } from './ResponseFactory';


@Controller()
export class BaseController {
  constructor(public configService: ConfigService) {}

  sendResponse<T>({
    result,
    res,
    successMessage,
  }: {
    result: any;
    res: Response;
    successMessage?: string;
  }) {
    const environment =
      this.configService?.get<string>('NODE_ENV') || NODE_ENV.PRODUCTION;

    const response = ResponseFactory.createResponse(
      result,
      successMessage,
      environment
    );

    return res.status(response.code).send(response);
  }
}
