import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/entities/task';
import { StateManagerModule } from './state-manager/state-manager.module';
import { join, resolve } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(join(__dirname, '..', '..', '.env')),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        synchronize: true,
        entities: [Task],
      }),
    }),
    TasksModule,
    StateManagerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
