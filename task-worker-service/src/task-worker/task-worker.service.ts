import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { TaskType } from './tasks/tasks-type.enum';
import { TaskFactory } from './tasks/task-factory';

@Injectable()
export class TaskWorkerService {
  public async processTask(data, context: RmqContext) {
    const taskType: TaskType = TaskType[data.type as keyof typeof TaskType];
    const taskData = JSON.parse(taskType);

    const taskFactory = new TaskFactory(taskType);
    const task = taskFactory.generate();
    const taskResult = await task.execute(taskData);
  }
}
