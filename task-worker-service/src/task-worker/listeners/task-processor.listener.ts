import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { TaskProcessEventDto } from '../dtos/task-process-event.dto';
import { TaskType } from '../enums/tasks-type.enum';
import { Task } from '../interfaces/task.interface';
import { TaskFactory } from '../tasks/task-factory';
import { TaskProcessResultDto } from '../dtos/task-process-result.dto';

@Injectable()
export class TaskProcessorListener {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent('task.execute')
  async handleTaskExecution(event: TaskProcessEventDto): Promise<void> {
    const { taskId, type, data, channel, originalMessage } = event;

    const task = this.createTaskInstance(type);

    try {
      const result = await task.execute(data);
      this.eventEmitter.emit(
        'task.result',
        new TaskProcessResultDto(
          taskId,
          result,
          'completed',
          channel,
          originalMessage,
        ),
      );
    } catch (error) {
      this.eventEmitter.emit(
        'task.result',
        new TaskProcessResultDto(
          taskId,
          error,
          'completed',
          channel,
          originalMessage,
        ),
      );
    }
  }

  private createTaskInstance(type: TaskType): Task {
    const taskType: TaskType = TaskType[type as keyof typeof TaskType];
    const taskFactory = new TaskFactory(taskType);
    return taskFactory.generate();
  }
}
