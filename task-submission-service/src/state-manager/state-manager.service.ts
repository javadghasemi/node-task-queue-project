import { Injectable } from '@nestjs/common';
import { ChangeStateEventDto } from './dtos/change-state-event.dto';
import { RmqContext } from '@nestjs/microservices';
import { SetTaskResultEventDto } from './dtos/set-task-result-event.dto';
import { TasksService } from '../tasks/tasks.service';
import { OutboxProcessorService } from '../tasks/outbox/outbox-processor.service';
import { TaskStatusEnum } from '../enums/task-status.enum';

@Injectable()
export class StateManagerService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly outboxProcessorService: OutboxProcessorService,
  ) {}

  public async changeState(data: ChangeStateEventDto, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const taskId = data.taskId;
    const status: TaskStatusEnum = data.status;

    await this.outboxProcessorService.updateOutboxStatus(taskId, status);
    await this.tasksService.updateStatus(taskId, status);

    channel.ack(originalMessage);
  }

  public async setResult(data: SetTaskResultEventDto, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const taskId = data.taskId;

    await this.tasksService.addResult(taskId, data.result);

    channel.ack(originalMessage);
  }
}
