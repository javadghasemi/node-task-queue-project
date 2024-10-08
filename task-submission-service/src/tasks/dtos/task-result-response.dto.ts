export class TaskResultResponseDto {
  constructor(
    taskId: string,
    status: string,
    result: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.taskId = taskId;
    this.status = status;
    this.result = result;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  taskId: string;
  status: string;
  result: string;
  createdAt: Date;
  updatedAt: Date;
}
