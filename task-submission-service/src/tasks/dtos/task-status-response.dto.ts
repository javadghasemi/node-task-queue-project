export class TaskStatusResponseDto {
  constructor(taskId: string, status: string) {
    this.taskId = taskId;
    this.status = status;
  }

  taskId: string;
  status: string;
}
