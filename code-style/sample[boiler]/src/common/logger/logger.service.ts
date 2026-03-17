/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class ColoredLogger extends ConsoleLogger {
  private stringifyValue(value: any): string {
    if (value === null || value === undefined) {
      return String(value);
    }
    if (typeof value === 'object' || Array.isArray(value)) {
      try {
        return JSON.stringify(value);
      } catch (err) {
        return String(value);
      }
    }
    return String(value);
  }

  protected formatMessage(message: any, ...data: any[]): string {
    const messageStr = this.stringifyValue(message);
    if (data.length === 0) {
      return messageStr;
    }
    const dataStr = data.map((item) => this.stringifyValue(item)).join(' ');
    return `${messageStr} ${dataStr}`;
  }

  log(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.log(formattedMessage);
  }

  info(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.log(formattedMessage);
  }

  error(error: any, ...data: any[]) {
    let message: string;
    if (error instanceof Error) {
      const msg = error.message || this.stringifyValue(error);
      const trace = error.stack || '';
      message = this.formatMessage(`${msg} ${trace}`, ...data);
    } else {
      message = this.formatMessage(error, ...data);
    }
    console.error(message);
  }

  warn(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.warn(formattedMessage);
  }

  debug(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.debug(formattedMessage);
  }

  verbose(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.log(formattedMessage);
  }
}
