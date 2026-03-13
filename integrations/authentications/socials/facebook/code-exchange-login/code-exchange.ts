import axios from "axios";
import { ConfigService } from "@nestjs/config";
export class FacebookExchangeCodeLogin {
  private FACEBOOK_APP_ID: string;
  private FACEBOOK_REDIRECT_URI: string;
  constructor(private readonly configService: ConfigService) {
    this.FACEBOOK_APP_ID = this.configService.get<string>("FACEBOOK_APP_ID");
    this.FACEBOOK_REDIRECT_URI = this.configService.get<string>(
      "FACEBOOK_REDIRECT_URI",
    );
  }
  async generateUrl(state?: string) {
    const params = {
      client_id: this.FACEBOOK_APP_ID,
      redirect_uri: this.FACEBOOK_REDIRECT_URI,
      response_type: "code",
      scope: "email public_profile",
      state: state || "",
    };
    return `https://www.facebook.com/v19.0/dialog/oauth?${new URLSearchParams(
      params,
    ).toString()}`;
  }

  async exchangeCodeForToken(code: string) {
    const params = {
      client_id: this.FACEBOOK_APP_ID,
      redirect_uri: this.FACEBOOK_REDIRECT_URI,
      client_secret: this.configService.get<string>("FACEBOOK_APP_SECRET"),
      code,
    };
    const response = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params,
      },
    );
    return response.data;
  }

  async fetchUserInfo(accessToken: string) {
    const response = await axios.get("https://graph.facebook.com/v19.0/me", {
      params: {
        fields: "id,name,email",
        access_token: accessToken,
      },
    });
    return response.data;
  }
}
