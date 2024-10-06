import { TaskType } from './tasks-type.enum';
import { ImageProcessingTask } from './image-processing.task';
import { Task } from './task.interface';

export class TaskFactory {
  constructor(private readonly taskType: TaskType) {}

  generate(): Task {
    switch (this.taskType) {
      case TaskType.ImageProcessing:
        return new ImageProcessingTask();
    }
  }
}
