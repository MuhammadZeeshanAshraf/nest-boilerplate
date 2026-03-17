import { TOKEN_PURPOSE } from '../constants/enums';

export interface Context {
  [key: string]: any;
}

export interface ApplicationContext extends Context {
  get UserId(): number;
  get Email(): string;
  get Purpose(): string;
  get Onboarded(): boolean;
  get Verified(): boolean;
}

export class AppContext implements ApplicationContext {
  private readonly userId: number;

  private readonly email: string;

  private readonly purpose: TOKEN_PURPOSE;

  private readonly onboarded: boolean;

  private readonly verified: boolean;

  constructor(data: {
    id: number;
    email: string;
    purpose: TOKEN_PURPOSE;
    onboarded: boolean;
    verified: boolean;
  }) {
    this.userId = data.id;
    this.email = data.email;
    this.purpose = data.purpose;
    this.onboarded = data.onboarded;
    this.verified = data.verified;
  }

  get Purpose(): string {
    return this.purpose;
  }

  get UserId(): number {
    return this.userId;
  }

  get Email(): string {
    return this.email;
  }

  get Onboarded(): boolean {
    return this.onboarded;
  }

  get Verified(): boolean {
    return this.verified;
  }
}
