import { Module } from '@nestjs/common';
import { TaskWorkerController } from './task-worker.controller';
import { TaskWorkerService } from './task-worker.service';

@Module({
  controllers: [TaskWorkerController],
  providers: [TaskWorkerService]
})
export class TaskWorkerModule {}
