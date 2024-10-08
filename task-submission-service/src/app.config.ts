import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from './tasks/entities/task';
import { WinstonModuleOptions } from 'nest-winston';

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

export function createTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST'),
    port: configService.get<number>('POSTGRES_PORT'),
    username: configService.get<string>('POSTGRES_USER'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    database: configService.get<string>('POSTGRES_DB'),
    synchronize: true,
    entities: [Task],
  };
}
