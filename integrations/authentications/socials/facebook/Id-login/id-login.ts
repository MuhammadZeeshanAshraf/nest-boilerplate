import axios from "axios";
import { ConfigService } from "@nestjs/config";

export class FacebookService {
  private FACEBOOK_APP_ID: string;
  private FACEBOOK_APP_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.FACEBOOK_APP_ID = this.configService.get<string>("FACEBOOK_APP_ID");
    this.FACEBOOK_APP_SECRET = this.configService.get<string>(
      "FACEBOOK_APP_SECRET",
    );
  }

  async verifyIdToken(accessToken: string): Promise<any> {
    const response = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email,picture",
        access_token: accessToken,
      },
    });

    return response.data;
  }
}
