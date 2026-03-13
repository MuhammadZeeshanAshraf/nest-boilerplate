import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
export class AppleExchangeCodeLogin {
  private APPLE_CLIENT_ID: string;
  private APPLE_REDIRECT_URI: string;
  private APPLE_PRIVATE_KEY: string;
  private APPLE_TEAM_ID: string;
  private APPLE_KEY_ID: string;
  private jwks = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
  });
  constructor(private readonly configService: ConfigService) {
    this.APPLE_CLIENT_ID = this.configService.get<string>("APPLE_CLIENT_ID");
    this.APPLE_REDIRECT_URI =
      this.configService.get<string>("APPLE_REDIRECT_URI");
    this.APPLE_PRIVATE_KEY =
      this.configService.get<string>("APPLE_PRIVATE_KEY");
    this.APPLE_TEAM_ID = this.configService.get<string>("APPLE_TEAM_ID");
    this.APPLE_KEY_ID = this.configService.get<string>("APPLE_KEY_ID");
  }
  async generateUrl(state?: string) {
    const params = {
      client_id: this.APPLE_CLIENT_ID,
      redirect_uri: this.APPLE_REDIRECT_URI,
      response_type: "code",
      scope: "name email",
      response_mode: "query",
      state: state || "",
    };
    return `https://appleid.apple.com/auth/authorize?${new URLSearchParams(
      params,
    ).toString()}`;
  }
  generateAppleClientSecret(): string {
    const now = Math.floor(Date.now() / 1000);

    const privateKey = Buffer.from(this.APPLE_PRIVATE_KEY, "base64").toString(
      "utf8",
    );

    const payload = {
      iss: this.APPLE_TEAM_ID,
      iat: now,
      exp: now + 86400 * 180,
      aud: "https://appleid.apple.com",
      sub: this.APPLE_CLIENT_ID,
    };

    const header = {
      kid: this.APPLE_KEY_ID,
      alg: "ES256",
    };

    return jwt.sign(payload, privateKey, {
      algorithm: "ES256",
      header,
    });
  }
  async exchangeCodeForToken(code: string) {
    const params = {
      code: code,
      client_id: this.APPLE_CLIENT_ID,
      client_secret: this.generateAppleClientSecret(),
      redirect_uri: this.APPLE_REDIRECT_URI,
      grant_type: "authorization_code",
    };
    const response = await axios.post(
      `https://appleid.apple.com/auth/token?${new URLSearchParams(
        params,
      ).toString()}`,
    );
    return response.data;
  }

  async fetchAppleUserInfo(idToken: string) {
    const data: any = await new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        (header, cb) => this.getKey(header, cb),
        {
          algorithms: ["RS256"],
          audience: this.APPLE_CLIENT_ID,
          issuer: "https://appleid.apple.com",
        },
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        },
      );
    });

    const sub = data.sub;
    const email = data.email || "";
    const emailVerified =
      typeof data.email_verified === "boolean"
        ? data.email_verified
        : data.email_verified === "true";

    return {
      sub,
      email,
      emailVerified,
    };
  }
  getKey(
    header: JwtHeader,
    callback: (err: Error | null, key?: string) => void,
  ) {
    this.jwks.getSigningKey(header.kid as string, (err, key) => {
      if (err) {
        callback(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  }
}
