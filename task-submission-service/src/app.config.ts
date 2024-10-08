import { ConfigService } from '@nestjs/config';
import { utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from './tasks/entities/task';

export function createWinstonConfig() {
  return {
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonUtilities.format.nestLike('task-submission-service', {
            colors: true,
            prettyPrint: true,
            processId: true,
          }),
        ),
      }),
    ],
  };
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
