import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { APP_ERROR_MESSAGES } from '../constants/errors';
import { AppContext } from '../interfaces/context.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly CONTEXT: string = 'context';

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return this.verifyJwt(request);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async verifyJwt(req: any) {
    const authorizationToken = req.headers.authorization;
    if (
      !authorizationToken ||
      authorizationToken.split(' ')?.[0] !== 'Bearer'
    ) {
      throw new ForbiddenException(APP_ERROR_MESSAGES.NO_TOKEN_PROVIDED);
    }
    const token = authorizationToken.split(' ')[1];
    if (!token) {
      throw new ForbiddenException(APP_ERROR_MESSAGES.MALFORMED_TOKEN);
    }
    const decoded = await this.verifyToken(token);
    req[AuthGuard.CONTEXT] = new AppContext(decoded);
    req.user = decoded;
    return true;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    const payload = await new Promise((resolve) => {
      jwt.verify(
        token,
        this.configService.getOrThrow('JWT_ACCESS_SECRET'),
        (error, decoded: JwtPayload) => {
          if (error) {
            resolve(error);
          } else {
            resolve(decoded);
          }
        },
      );
    });
    if (payload instanceof Error) {
      if (payload instanceof jwt.TokenExpiredError) {
        throw new ForbiddenException(APP_ERROR_MESSAGES.TOKEN_EXPIRED);
      }
      throw new ForbiddenException(APP_ERROR_MESSAGES.INVALID_TOKEN);
    }

    return payload as JwtPayload;
  }
}
