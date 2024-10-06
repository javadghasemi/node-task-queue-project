import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task';
import { Repository } from 'typeorm';
import { ChangeStateEventDto } from './dtos/change-state-event.dto';
import { RmqContext } from '@nestjs/microservices';
import { SetTaskResultEventDto } from './dtos/set-task-result-event.dto';

@Injectable()
export class StateManagerService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  public async changeState(data: ChangeStateEventDto, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const taskId = data.taskId;
    const status = data.status;

    await this.taskRepository.update({ taskId }, { status });

    channel.ack(originalMessage);
  }

  public async setResult(data: SetTaskResultEventDto, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const taskId = data.taskId;

    await this.taskRepository.update(
      { taskId },
      { status: 'completed', result: data.result },
    );

    channel.ack(originalMessage);
  }
}
