export class TaskResultResponseDto {
  taskId: string;
  status: string;
  result: string;

  constructor(taskId: string, status: string, result: string) {
    this.taskId = taskId;
    this.status = status;
    this.result = result;
  }
}
