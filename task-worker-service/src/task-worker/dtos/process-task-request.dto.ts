import { TaskType } from '../enums/tasks-type.enum';

export class ProcessTaskRequestDto {
  taskId: string;
  data: string;
  type: TaskType;
  status: string;
}
