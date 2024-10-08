import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateManagerModule } from './state-manager/state-manager.module';
import { join, resolve } from 'node:path';
import { WinstonModule } from 'nest-winston';
import { createTypeOrmConfig, createWinstonConfig } from './app.config';
import { RequestLoggingMiddleware } from './request-logging/request-logging.middleware';

@Module({
  imports: [
    WinstonModule.forRoot(createWinstonConfig()),
    ConfigModule.forRoot({
      envFilePath: resolve(join(__dirname, '..', '..', '.env')),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createTypeOrmConfig(configService),
    }),
    TasksModule,
    StateManagerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
