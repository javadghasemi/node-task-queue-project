export class TaskProcessResultDto {
  taskId: string;
  result: any;
  status: string;
  public channel: any;
  public originalMessage: any;

  constructor(
    taskId: string,
    result: any,
    status: string,
    channel: any,
    originalMessage: any,
  ) {
    this.taskId = taskId;
    this.result = result;
    this.status = status;
    this.channel = channel;
    this.originalMessage = originalMessage;
  }
}
