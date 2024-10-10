import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const environment = process.env.NODE_ENV || 'development';

export function createWinstonConfig(): WinstonModuleOptions {
  const productionFormat: WinstonModuleOptions = {
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    ],
  };

  const developmentFormat: WinstonModuleOptions = {
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
          }),
        ),
      }),
    ],
  };

  return environment === 'development' ? developmentFormat : productionFormat;
}
