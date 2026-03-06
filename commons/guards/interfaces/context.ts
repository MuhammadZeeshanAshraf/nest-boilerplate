export interface Context {
  [key: string]: any;
}
// Todo adjust to your workflow
export interface ApplicationContext extends Context {
  get UserId(): number;
  get Email(): string;
  get Verified(): boolean;
}

export class AppContext implements ApplicationContext {
  private readonly userId: number;

  private readonly email: string;

  private readonly verified: boolean;

  constructor(data: { id: number; email: string; verified: boolean }) {
    this.userId = data.id;
    this.email = data.email;
    this.verified = data.verified;
  }

  get UserId(): number {
    return this.userId;
  }

  get Email(): string {
    return this.email;
  }

  get Verified(): boolean {
    return this.verified;
  }
}
