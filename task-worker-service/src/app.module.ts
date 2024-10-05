import { Module } from '@nestjs/common';
import { TaskWorkerModule } from './task-worker/task-worker.module';

@Module({
  imports: [TaskWorkerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
