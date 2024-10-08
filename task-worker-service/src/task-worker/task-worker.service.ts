import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { TaskProcessResultDto } from './dtos/task-process-result.dto';
import { TaskProcessEventDto } from './dtos/task-process-event.dto';

@Injectable()
export class TaskWorkerService {
  private readonly logger = new Logger(TaskWorkerService.name);

  constructor(
    @Inject('STATE_QUEUE') private readonly stateQueueClient: ClientProxy,
    private readonly processorEventEmitter: EventEmitter2,
  ) {}

  public async processTask(data: any, context: RmqContext): Promise<void> {
    const { taskId, status, type, data: taskDataString } = data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logTaskReceived(taskId, status);
    await this.updateTaskState(taskId, 'in-process');

    const taskData = JSON.parse(taskDataString);

    this.processorEventEmitter.emit(
      'task.execute',
      new TaskProcessEventDto(taskId, type, taskData, channel, originalMessage),
    );
  }

  @OnEvent('task.result')
  public async handleTaskResult(event: TaskProcessResultDto): Promise<void> {
    const { taskId, result, status, channel, originalMessage } = event;

    try {
      await this.updateTaskResult(taskId, result, status);
      this.logger.log(
        `Task processed successfully - taskId: ${taskId}, status: ${status}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to submit task result - taskId: ${taskId}, status: ${status}`,
        error,
      );
    }

    channel.ack(originalMessage);
  }

  private logTaskReceived(taskId: string, status: string): void {
    this.logger.log(`Task received - taskId: ${taskId}, status: ${status}`);
  }

  private logTaskSuccess(taskId: string): void {
    this.logger.log(
      `Task processed successfully - taskId: ${taskId}, status: completed`,
    );
  }

  private logTaskError(taskId: string, error: any): void {
    this.logger.error(
      `Task process failed - taskId: ${taskId}, status: failed`,
    );
    this.logger.debug({ taskId, error });
  }

  private async updateTaskState(taskId: string, status: string): Promise<void> {
    await lastValueFrom(
      this.stateQueueClient.emit('change_state', { taskId, status }),
    );
    this.logger.log(
      `Task state changed - taskId: ${taskId}, status: ${status}`,
    );
  }

  private async updateTaskResult(
    taskId: string,
    result: any,
    status: string,
  ): Promise<void> {
    await lastValueFrom(
      this.stateQueueClient.emit('add_result', { taskId, result, status }),
    );
  }
}
