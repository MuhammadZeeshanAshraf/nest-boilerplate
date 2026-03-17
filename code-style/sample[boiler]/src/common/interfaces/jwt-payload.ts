import { TOKEN_PURPOSE } from '../constants/enums';

export interface JwtPayload {
  id: number;
  email: string;
  purpose: TOKEN_PURPOSE;
  onboarded: boolean;
  verified: boolean;
}
