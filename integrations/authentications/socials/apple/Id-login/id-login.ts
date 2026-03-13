import appleSignin, { AppleIdTokenType } from "apple-signin-auth";
import { ConfigService } from "@nestjs/config";
export class AppleService {
  private APPLE_CLIENT_ID: string;
  private APPLE_SERVICE_ID_WEB: string;
  constructor(private readonly configService: ConfigService) {
    this.APPLE_CLIENT_ID = this.configService.get("APPLE_CLIENT_ID");
    this.APPLE_SERVICE_ID_WEB = this.configService.get("APPLE_SERVICE_ID_WEB");
  }

  async verifyIdToken(
    idToken: string,
    platform?: string,
  ): Promise<AppleIdTokenType> {
    let audience = this.APPLE_CLIENT_ID;
    if (platform === "ios") {
      audience = this.APPLE_CLIENT_ID;
    } else if (platform === "web") {
      audience = this.APPLE_SERVICE_ID_WEB;
    } else {
      audience = this.APPLE_CLIENT_ID;
    }

    const resp = await appleSignin.verifyIdToken(idToken, {
      audience,
      // nonce: 'NONCE',
      ignoreExpiration: true,
    });
    return resp;
  }
}
