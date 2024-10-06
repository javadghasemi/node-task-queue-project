import { TaskType } from '../tasks/tasks-type.enum';

export class ProcessTaskRequestDto {
  taskId: string;
  data: string;
  type: TaskType;
  status: string;
}
