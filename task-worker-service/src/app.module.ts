import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TaskWorkerModule } from './task-worker/task-worker.module';
import { join, resolve } from 'node:path';
import { ClusteringService } from './clustering.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve(join(__dirname, '..', '..', '.env')),
    }),
    TaskWorkerModule,
  ],
  controllers: [],
  providers: [ClusteringService],
})
export class AppModule {}
