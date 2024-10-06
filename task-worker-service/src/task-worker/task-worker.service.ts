import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { TaskType } from './tasks/tasks-type.enum';
import { TaskFactory } from './tasks/task-factory';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TaskWorkerService {
  private readonly logger: Logger = new Logger(TaskWorkerService.name);

  constructor(
    @Inject('STATE_QUEUE') private readonly stateQueueClient: ClientProxy,
  ) {}

  public async processTask(data, context: RmqContext) {
    this.logger.log(
      `Task received - taskId: ${data.taskId}, status: ${data.status}`,
    );

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    await lastValueFrom(
      this.stateQueueClient.emit('change_state', {
        taskId: data.taskId,
        status: 'in-process',
      }),
    );

    this.logger.log(
      `Task state changed - taskId: ${data.taskId}, status: in-process`,
    );

    const taskType: TaskType = TaskType[data.type as keyof typeof TaskType];
    const taskData = JSON.parse(data.data);

    const taskFactory = new TaskFactory(taskType);
    const task = taskFactory.generate();

    try {
      const taskResult = await task.execute(taskData);

      await lastValueFrom(
        this.stateQueueClient.emit('add_result', {
          taskId: data.taskId,
          result: taskResult,
          status: 'completed',
        }),
      );

      this.logger.log(
        `Task processed successfully - taskId: ${data.taskId}, status: completed`,
      );

      channel.ack(originalMessage);
    } catch (e) {
      this.logger.error(
        `Task process failed - taskId: ${data.taskId}, status: failed`,
      );

      this.logger.debug({
        taskId: data.taskId,
        error: e,
      });

      await lastValueFrom(
        this.stateQueueClient.emit('add_result', {
          taskId: data.taskId,
          result: e,
          status: 'failed',
        }),
      );
    }
  }
}
