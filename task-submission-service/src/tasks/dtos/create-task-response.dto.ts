import { TaskStatusEnum } from '../../enums/task-status.enum';

export class CreateTaskResponseDto {
  taskId: string;
  status: string;
  message: string;

  constructor(taskId: string, status: TaskStatusEnum, message: string) {
    this.taskId = taskId;
    this.status = status;
    this.message = message;
  }
}
