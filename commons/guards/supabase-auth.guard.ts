import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { Context } from "./interfaces/context";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwksClient: JwksClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    const supabaseUrl = this.configService.getOrThrow<string>("SUPABASE_URL");

    const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

    this.jwksClient = new JwksClient({
      jwksUri,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
      rateLimit: true,
    });
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
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

  async verifyJwt(req: any): Promise<boolean> {
    const authorizationToken = req.headers.authorization;
    if (
      !authorizationToken ||
      authorizationToken.split(" ")?.[0] !== "Bearer"
    ) {
      throw new ForbiddenException("No token provided.");
    }
    const token = authorizationToken.split(" ")[1];
    if (!token) {
      throw new ForbiddenException("Token is malformed.");
    }

    const decoded = await this.verifyToken(token);

    // Todo adjust context to your workflow
    const appContext: Context = {
      userId: decoded.sub,
      email: decoded.email,
    };

    req.context = appContext;
    req.user = appContext;
    return true;
  }

  async verifyToken(token: string): Promise<{ sub: string; email: string }> {
    const getKey = (
      header: jwt.JwtHeader,
      callback: jwt.SigningKeyCallback,
    ) => {
      this.jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
          callback(err, undefined);
        } else {
          const signingKey = key?.getPublicKey();
          callback(null, signingKey);
        }
      });
    };

    const payload = await new Promise((resolve) => {
      jwt.verify(
        token,
        getKey as jwt.GetPublicKeyOrSecret,
        { algorithms: ["ES256"] },
        (error, decoded) => {
          if (error) {
            resolve(error);
          } else {
            resolve(decoded);
          }
        },
      );
    });

    if (payload instanceof Error) {
      throw new ForbiddenException(`Invalid token: ${payload.message}`);
    }

    return payload as { sub: string; email: string };
  }
}
