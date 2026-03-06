import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import { Observable } from "rxjs";
import { APP_ERROR_MESSAGES } from "../constants/errors";
import { AppContext } from "./interfaces/context";
import { JwtPayload } from "./interfaces/jwt-payload";

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly CONTEXT: string = "context";

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return this.verifyJwt(request);
  }

  async verifyJwt(req: any) {
    const authorizationToken = req.headers.authorization;
    if (
      !authorizationToken ||
      authorizationToken.split(" ")?.[0] !== "Bearer"
    ) {
      throw new ForbiddenException(APP_ERROR_MESSAGES.NO_TOKEN_PROVIDED);
    }
    const token = authorizationToken.split(" ")[1];
    if (!token) {
      throw new ForbiddenException(APP_ERROR_MESSAGES.MALFORMED_TOKEN);
    }
    const decoded = await this.verifyToken(token);
    req[AuthGuard.CONTEXT] = new AppContext(decoded);
    req.user = decoded;
    return true;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    await new Promise((resolve) => {
      jwt.verify(
        token,
        this.configService.getOrThrow("JWT_ACCESS_SECRET"),
        {
          ignoreExpiration: true,
        },
        (error, decoded) => {
          if (error) {
            resolve(error);
          } else {
            resolve(decoded as JwtPayload);
          }
        },
      );
    });
    const payload = await new Promise((resolve) => {
      jwt.verify(
        token,
        this.configService.getOrThrow("JWT_ACCESS_SECRET"),
        (error, decoded: JwtPayload) => {
          if (error) {
            if (error instanceof jwt.TokenExpiredError) {
              const decodeTest = jwt.decode(token) as any;
              // if (decodeTest?.email && TestEmails.includes(decodeTest?.email)) {
              resolve(decodeTest);
            }
            // }

            resolve(error);
          } else {
            resolve(decoded);
          }
        },
      );
    });
    if (payload instanceof Error) {
      // if (payload instanceof jwt.TokenExpiredError) {
      //   throw new ExpiredTokenException();
      // }
      throw new ForbiddenException(APP_ERROR_MESSAGES.INVALID_TOKEN);
    }

    return payload as JwtPayload;
  }
}
