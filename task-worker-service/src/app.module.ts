import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TaskWorkerModule } from './task-worker/task-worker.module';
import { join, resolve } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(join(__dirname, '..', '..', '.env')),
    }),
    TaskWorkerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
