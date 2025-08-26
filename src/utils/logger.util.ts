import {
  createLogger,
  format,
  Logger,
  transports as WinstonTransports,
} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LEVEL, TRANSPORT } from '../configs/logger.config';
import { getTimeString } from './date.util';

export class LoggerUtil {
  private static logger: Logger;
  private static instance: LoggerUtil;

  private readonly meta = { classname: '' };
  private readonly hiddenField = ['password', 'token'];

  public constructor(classname: string) {
    this.meta.classname = classname;
  }

  static {
    const transports: (
      | WinstonTransports.ConsoleTransportInstance
      | DailyRotateFile
    )[] = [];

    const createFileTransport: () => DailyRotateFile = () =>
      new DailyRotateFile({
        filename: 'together-safe-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      });

    if (TRANSPORT.toLowerCase() === 'file') {
      transports.push(createFileTransport());
    } else if (TRANSPORT.toLowerCase() === 'both') {
      transports.push(new WinstonTransports.Console({}), createFileTransport());
    } else {
      transports.push(new WinstonTransports.Console({}));
    }

    LoggerUtil.logger = createLogger({
      level: LEVEL,
      transports,
      format: format.printf((info) => {
        const level = info.level;
        const message = info.message as string;
        const classname = info.classname as string;

        const date = new Date();
        const time = getTimeString(date);

        return `${time} - ${level.toUpperCase()} [${classname}] ${message}`;
      }),
    });

    LoggerUtil.instance = new LoggerUtil('Global');
  }

  public static getGlobalInstance(): LoggerUtil {
    return LoggerUtil.instance;
  }

  public debug(message: string, dataObject?: object | string) {
    const data: string = dataObject ? this.logFormat(dataObject) : '';
    LoggerUtil.logger.debug(`${message}${data}`, this.meta);
  }

  public info(message: string) {
    LoggerUtil.logger.info(message, this.meta);
  }

  public http(message: string) {
    LoggerUtil.logger.http(message, this.meta);
  }

  public error(error: string | Error) {
    const message =
      error instanceof Error
        ? (error.stack ?? 'an unexpected error has occurred')
        : error;

    LoggerUtil.logger.error(message, this.meta);
  }

  private logFormat(data: object | string): string {
    let formattedData: Record<string, any> = {};

    try {
      if (typeof data === 'string') {
        formattedData = JSON.parse(data);
      } else {
        formattedData = { ...data };
      }
    } catch {
      return data as string;
    }

    this.hiddenField.forEach((key) => {
      if (key in formattedData) {
        formattedData[key] = '[hidden]';
      }
    });

    return JSON.stringify(formattedData, null, 2);
  }
}
