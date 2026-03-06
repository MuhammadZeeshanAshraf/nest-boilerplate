import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    // Todo add your api key
    const apiKey = request.headers["123"];
    if (!apiKey) {
      throw new UnauthorizedException("API key is missing");
    }

    const validApiKey = this.configService.get<string>("X_API_KEY");
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException("Invalid API Key");
    }
    return true;
  }
}
