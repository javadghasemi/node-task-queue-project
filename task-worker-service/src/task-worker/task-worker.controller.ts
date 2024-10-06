import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { TaskWorkerService } from './task-worker.service';
import { ProcessTaskRequestDto } from './dtos/process-task-request.dto';

@Controller('task-worker')
export class TaskWorkerController {
  constructor(private readonly taskWorkerService: TaskWorkerService) {}

  @MessagePattern('process')
  processTask(
    @Payload() data: ProcessTaskRequestDto,
    @Ctx() context: RmqContext,
  ) {
    return this.taskWorkerService.processTask(data, context);
  }
}
