import { Body, Controller, Post } from '@nestjs/common';
import { CreateTaskRequestDto } from './dtos/create-task-request.dto';
import { TasksService } from './tasks.service';

@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  public async create(@Body() createTask: CreateTaskRequestDto) {
    return this.tasksService.create(createTask);
  }
}
