import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/entities/task';
import { StateManagerModule } from './state-manager/state-manager.module';
import { join, resolve } from 'node:path';

const env = process.env;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(join(__dirname, '..', '..', '.env')),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.POSTGRES_HOST,
      port: parseInt(env.POSTGRES_PORT),
      username: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      database: env.POSTGRES_DB,
      synchronize: true,
      entities: [Task],
    }),
    TasksModule,
    StateManagerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
