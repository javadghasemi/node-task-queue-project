export class TaskStatusResponseDto {
  constructor(
    taskId: string,
    status: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.taskId = taskId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  taskId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
