import { HttpException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/enums';
import { APP_ERROR_MESSAGES } from '../constants/errors';

export class ExpiredTokenException extends HttpException {
  constructor() {
    super(
      {
        message: APP_ERROR_MESSAGES.EXPIRED_TOKEN,
        errorCode: ERROR_CODES.EXPIRED_TOKEN,
      },
      498,
    );
  }
}
