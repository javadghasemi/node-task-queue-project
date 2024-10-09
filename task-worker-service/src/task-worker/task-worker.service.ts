import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { TaskProcessResultDto } from './dtos/task-process-result.dto';
import { TaskProcessEventDto } from './dtos/task-process-event.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class TaskWorkerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('STATE_QUEUE') private readonly stateQueueClient: ClientProxy,
    private readonly processorEventEmitter: EventEmitter2,
  ) {}

  public async processTask(data: any, context: RmqContext): Promise<void> {
    const { taskId, status, type, data: taskDataString } = data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logger.debug('Received message from RabbitMQ', { taskId, status });

    this.logTaskReceived(taskId, status);

    try {
      await this.updateTaskState(taskId, 'in-process');

      const taskData = JSON.parse(taskDataString);
      this.logger.debug('Task data parsed', { taskId, type });

      this.processorEventEmitter.emit(
        'task.execute',
        new TaskProcessEventDto(
          taskId,
          type,
          taskData,
          channel,
          originalMessage,
        ),
      );
    } catch (error) {
      this.logTaskError(taskId, error);
      channel.nack(originalMessage); // Reject message if parsing or processing fails
    }
  }

  @OnEvent('task.result')
  public async handleTaskResult(event: TaskProcessResultDto): Promise<void> {
    const { taskId, result, status, channel, originalMessage } = event;

    this.logger.debug('Handling task result', { taskId, status });

    try {
      await this.updateTaskResult(taskId, result, status);
      this.logTaskSuccess(taskId, status);
    } catch (error) {
      this.logger.error('Failed to submit task result', {
        taskId,
        status,
        error: error.message,
        stack: error.stack,
      });
    }

    channel.ack(originalMessage);
  }

  private logTaskReceived(taskId: string, status: string): void {
    this.logger.info('Task received', { taskId, status });
  }

  private logTaskSuccess(taskId: string, status: string): void {
    this.logger.info('Task processed successfully', { taskId, status });
  }

  private logTaskError(taskId: string, error: any): void {
    this.logger.error('Task processing failed', {
      taskId,
      error: error.message,
      stack: error.stack,
    });
    this.logger.debug('Error details', { taskId, error });
  }

  private async updateTaskState(taskId: string, status: string): Promise<void> {
    try {
      await lastValueFrom(
        this.stateQueueClient.emit('change_state', { taskId, status }),
      );

      this.logger.info('Task state updated', { taskId, status });
    } catch (error) {
      this.logger.error('Failed to update task state', {
        taskId,
        status,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  private async updateTaskResult(
    taskId: string,
    result: any,
    status: string,
  ): Promise<void> {
    try {
      await lastValueFrom(
        this.stateQueueClient.emit('add_result', { taskId, result, status }),
      );

      this.logger.debug('Task result sent to state queue', {
        taskId,
        status,
        result,
      });
    } catch (error) {
      this.logger.error('Failed to update task result', {
        taskId,
        status,
        error: error.message,
        stack: error.stack,
      });
    }
  }
}
