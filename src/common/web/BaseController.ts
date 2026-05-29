import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { NODE_ENV } from '../constants';
import { ResponseFactory } from './ResponseFactory';

export abstract class BaseController {
  constructor(protected readonly configService: ConfigService) {}

  sendResponse({
    result,
    res,
    successMessage,
  }: {
    result: unknown;
    res: Response;
    successMessage?: string;
  }) {
    const environment =
      this.configService?.get<string>('NODE_ENV') ?? NODE_ENV.PRODUCTION;

    const response = ResponseFactory.createResponse(
      result,
      successMessage,
      environment,
    );

    return res.status(response.code).send(response);
  }
}
