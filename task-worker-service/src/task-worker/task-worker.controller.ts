import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller('task-worker')
export class TaskWorkerController {
  @MessagePattern('process')
  processTask(@Payload() data, @Ctx() context: RmqContext) {}
}
