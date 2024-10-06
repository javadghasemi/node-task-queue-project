import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskRequestDto } from './dtos/create-task-request.dto';
import { Task } from './entities/task';
import { v4 as uid } from 'uuid';
import { TaskStatus } from './enums/TaskStatus';
import { CreateTaskResponseDto } from './dtos/create-task-response.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TaskClient') private readonly TaskQueueClient: ClientProxy,
    @InjectRepository(Task) private readonly TaskRepository: Repository<Task>,
  ) {}

  public async create(
    createTaskDto: CreateTaskRequestDto,
  ): Promise<CreateTaskResponseDto> {
    let taskData = createTaskDto.data;

    if (typeof taskData === 'object') {
      taskData = JSON.stringify(taskData);
    }

    const task = this.TaskRepository.create({
      taskId: uid(),
      data: taskData,
      status: TaskStatus.Queued,
      type: createTaskDto.type,
    });

    await this.TaskRepository.save(task);

    await lastValueFrom(
      this.TaskQueueClient.emit('process', {
        taskId: task.taskId,
        data: task.data,
        type: task.type,
        status: task.status,
      }),
    );

    await this.TaskRepository.update(task.id, { submitted: true });

    return new CreateTaskResponseDto(
      task.taskId,
      TaskStatus.Queued,
      'Task queued successfully',
    );
  }
}
