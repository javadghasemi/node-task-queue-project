import { TaskType } from '../enums/tasks-type.enum';
import { ImageProcessingTask } from './image-processing.task';
import { Task } from '../interfaces/task.interface';

export class TaskFactory {
  constructor(private readonly taskType: TaskType) {}

  generate(): Task {
    switch (this.taskType) {
      case TaskType.ImageProcessing:
        return new ImageProcessingTask();
    }
  }
}
