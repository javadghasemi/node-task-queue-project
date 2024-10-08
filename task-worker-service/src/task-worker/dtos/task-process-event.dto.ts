import { TaskType } from '../enums/tasks-type.enum';

export class TaskProcessEventDto {
  public taskId: string;
  public type: TaskType;
  public data: any;
  public channel: any;
  public originalMessage: any;

  constructor(
    taskId: string,
    type: TaskType,
    data: any,
    channel: any,
    originalMessage: any,
  ) {
    this.taskId = taskId;
    this.type = type;
    this.data = data;
    this.channel = channel;
    this.originalMessage = originalMessage;
  }
}
