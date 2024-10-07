import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTaskRequestDto } from './dtos/create-task-request.dto';
import { TasksService } from './tasks.service';

@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  public async create(@Body() createTask: CreateTaskRequestDto) {
    return this.tasksService.create(createTask);
  }

  @Get(':taskId/status')
  public async status(@Param('taskId') taskId: string) {
    return this.tasksService.status(taskId);
  }

  @Get(':taskId/result')
  public async result(@Param('taskId') taskId: string) {
    return this.tasksService.result(taskId);
  }
}
