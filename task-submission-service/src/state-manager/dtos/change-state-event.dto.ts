import { TaskStatus } from '../../enums/TaskStatus';

export class ChangeStateEventDto {
  public readonly taskId: string;
  public readonly status: TaskStatus;
}
