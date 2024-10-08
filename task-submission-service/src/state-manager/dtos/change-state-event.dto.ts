import { TaskStatus } from '../../tasks/enums/TaskStatus';

export class ChangeStateEventDto {
  public readonly taskId: string;
  public readonly status: TaskStatus;
}
