export interface ErrorInterface {
  status: boolean;
  message: string;
  error?: Error;
  name?: string;
}