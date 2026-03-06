/* eslint-disable no-console */
import { ConsoleLogger, Injectable } from "@nestjs/common";
import tracer from "dd-trace";
import * as fs from "fs";
import * as path from "path";

const logFile = path.resolve(process.cwd(), "app.log");
try {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
} catch (err) {
  console.error("Failed to create log directory", err);
}

@Injectable()
export class ColoredLogger extends ConsoleLogger {
  private writeOrNot: boolean = true;

  constructor() {
    super();
    this.writeOrNot = ["prod", "dev", "qa"].includes(process.env.NODE_ENV);
  }

  private stringifyValue(value: any): string {
    if (value === null || value === undefined) {
      return String(value);
    }
    if (typeof value === "object" || Array.isArray(value)) {
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
    const dataStr = data.map((item) => this.stringifyValue(item)).join(" ");
    return `${messageStr} ${dataStr}`;
  }

  private write(level: string, message: string) {
    try {
      const span = tracer.scope().active();
      const traceId = span?.context().toTraceId();
      const spanId = span?.context().toSpanId();
      const line = `[${new Date().toISOString()}] [${level}] [trace_id:${traceId || "-"} span_id:${spanId || "-"}] ${message}\n`;
      if (this.writeOrNot) fs.appendFileSync(logFile, line, "utf8");
    } catch (err) {
      console.error("Failed to write to log file", err);
    }
  }

  log(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.log(formattedMessage);
    this.write("INFO", formattedMessage);
  }

  info(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.log(formattedMessage);
    this.write("INFO", formattedMessage);
  }

  error(error: any, ...data: any[]) {
    let message: string;
    if (error instanceof Error) {
      const msg = error.message || this.stringifyValue(error);
      const trace = error.stack || "";
      message = this.formatMessage(`${msg} ${trace}`, ...data);
    } else {
      message = this.formatMessage(error, ...data);
    }
    console.error(message);
    this.write("ERROR", message);
  }

  warn(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.warn(formattedMessage);
    this.write("WARN", formattedMessage);
  }

  debug(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.debug(formattedMessage);
    this.write("DEBUG", formattedMessage);
  }

  extra(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.debug(formattedMessage);
    this.write("EXTRA", formattedMessage);
  }

  verbose(message: any, ...data: any[]) {
    const formattedMessage = this.formatMessage(message, ...data);
    console.log(formattedMessage);
    this.write("VERBOSE", formattedMessage);
  }
}
