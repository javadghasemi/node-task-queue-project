import { TaskStatus } from '../enums/TaskStatus';

export class CreateTaskResponseDto {
  taskId: string;
  status: string;
  message: string;

  constructor(taskId: string, status: TaskStatus, message: string) {
    this.taskId = taskId;
    this.status = status;
    this.message = message;
  }
}
