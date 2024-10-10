import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TaskWorkerModule } from './task-worker/task-worker.module';
import { join, resolve } from 'node:path';
import { ClusteringService } from './clustering.service';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './app.config';

@Module({
  imports: [
    WinstonModule.forRoot(createWinstonConfig()),
    ConfigModule.forRoot({
      envFilePath: resolve(join(__dirname, '..', '..', '.env')),
      isGlobal: true,
    }),
    TaskWorkerModule,
  ],
  controllers: [],
  providers: [ClusteringService],
})
export class AppModule {}
