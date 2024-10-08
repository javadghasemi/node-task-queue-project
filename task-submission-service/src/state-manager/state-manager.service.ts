import { Injectable } from '@nestjs/common';
import { ChangeStateEventDto } from './dtos/change-state-event.dto';
import { RmqContext } from '@nestjs/microservices';
import { SetTaskResultEventDto } from './dtos/set-task-result-event.dto';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class StateManagerService {
  constructor(private readonly tasksService: TasksService) {}

  public async changeState(data: ChangeStateEventDto, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const taskId = data.taskId;
    const status = data.status;

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
