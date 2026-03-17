export interface Context {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ApplicationContext extends Context {
  get UserId(): number;
  get Email(): string;
}

export class AppContext implements ApplicationContext {
  private readonly userId: number;

  private readonly email: string;

  constructor(data: { id: number; email: string }) {
    this.userId = data.id;
    this.email = data.email;
  }

  get UserId(): number {
    return this.userId;
  }

  get Email(): string {
    return this.email;
  }
}
