import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private writeLog(entry: LogEntry): void {
    fs.appendFileSync(this.logFile, this.formatLog(entry) + '\n');
  }

  private log(level: LogLevel, message: string, data?: any, stack?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
      ...(stack && { stack }),
    };

    this.writeLog(entry);

    const color = {
      [LogLevel.ERROR]: '\x1b[31m',
      [LogLevel.WARN]: '\x1b[33m',
      [LogLevel.INFO]: '\x1b[36m',
      [LogLevel.DEBUG]: '\x1b[35m',
    };

    console.log(
      `${color[level]}[${entry.timestamp}] ${level}: ${message}${data ? ' ' + JSON.stringify(data) : ''}\x1b[0m`
    );
  }

  error(message: string, error?: Error | any): void {
    this.log(LogLevel.ERROR, message, error?.message, error?.stack);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
}

export const logger = new Logger();
