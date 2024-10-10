import { TaskStatusEnum } from '../../enums/task-status.enum';

export class ChangeStateEventDto {
  public readonly taskId: string;
  public readonly status: TaskStatusEnum;
}
