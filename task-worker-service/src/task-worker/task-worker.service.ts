import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { TaskType } from './enums/tasks-type.enum';
import { TaskFactory } from './tasks/task-factory';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TaskWorkerService {
  private readonly logger = new Logger(TaskWorkerService.name);

  constructor(
    @Inject('STATE_QUEUE') private readonly stateQueueClient: ClientProxy,
  ) {}

  public async processTask(data: any, context: RmqContext): Promise<void> {
    const { taskId, status, type, data: taskDataString } = data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logTaskReceived(taskId, status);
    await this.updateTaskState(taskId, 'in-process');

    const taskData = JSON.parse(taskDataString);
    const task = this.createTaskInstance(type);

    try {
      const result = await task.execute(taskData);
      await this.updateTaskResult(taskId, result, 'completed');
      this.logTaskSuccess(taskId);
      channel.ack(originalMessage);
    } catch (error) {
      this.logTaskError(taskId, error);
      await this.updateTaskResult(taskId, error, 'failed');
    }
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

  private createTaskInstance(type: string): any {
    const taskType: TaskType = TaskType[type as keyof typeof TaskType];
    const taskFactory = new TaskFactory(taskType);
    return taskFactory.generate();
  }
}
