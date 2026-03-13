import { ConfigService } from "@nestjs/config";
import { OAuth2Client, TokenPayload } from "google-auth-library";

export class GoogleService {
  private GOOGLE_CLIENT_ID: string;
  private GOOGLE_CLIENT_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.GOOGLE_CLIENT_ID = this.configService.get<string>("GOOGLE_CLIENT_ID");
    this.GOOGLE_CLIENT_SECRET = this.configService.get<string>(
      "GOOGLE_CLIENT_SECRET",
    );
  }

  async verifyIdToken(
    idToken: string,
    redirectUri: string,
  ): Promise<TokenPayload> {
    const client = new OAuth2Client({
      clientId: this.GOOGLE_CLIENT_ID,
      clientSecret: this.GOOGLE_CLIENT_SECRET,
      redirectUri,
    });
    const verify = await client.verifyIdToken({
      idToken,
      audience: this.GOOGLE_CLIENT_ID,
    });
    return verify.getPayload();
  }
}
