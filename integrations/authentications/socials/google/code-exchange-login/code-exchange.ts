import axios from "axios";
import { ConfigService } from "@nestjs/config";
export class GoogleExchangeCodeLogin {
  private GOOGLE_CLIENT_ID: string;
  private GOOGLE_REDIRECT_URI: string;
  private GOOGLE_CLIENT_SECRET: string;
  constructor(private readonly configService: ConfigService) {
    this.GOOGLE_CLIENT_ID = this.configService.get<string>("GOOGLE_CLIENT_ID");
    this.GOOGLE_REDIRECT_URI = this.configService.get<string>(
      "GOOGLE_REDIRECT_URI",
    );
    this.GOOGLE_CLIENT_SECRET = this.configService.get<string>(
      "GOOGLE_CLIENT_SECRET",
    );
  }
  async generateUrl(state?: string) {
    const params = {
      client_id: this.GOOGLE_CLIENT_ID,
      redirect_uri: this.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
      state: state || "",
    };
    return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
      params,
    ).toString()}`;
  }

  async exchangeCodeForToken(code: string) {
    const params = {
      code: code,
      client_id: this.GOOGLE_CLIENT_ID,
      client_secret: this.GOOGLE_CLIENT_SECRET,
      redirect_uri: this.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    };
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams(params).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    return response.data;
  }

  async fetchUserInfo(accessToken: string) {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }
}
