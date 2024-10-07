import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskRequestDto } from './dtos/create-task-request.dto';
import { Task } from './entities/task';
import { v4 as uid } from 'uuid';
import { TaskStatus } from './enums/TaskStatus';
import { CreateTaskResponseDto } from './dtos/create-task-response.dto';
import { lastValueFrom } from 'rxjs';
import { TaskStatusResponseDto } from './dtos/task-status-response.dto';
import { TaskResultResponseDto } from './dtos/task-result-response.dto';

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

  public async status(taskId: string): Promise<TaskStatusResponseDto> {
    const task = await this.TaskRepository.findOneBy({ taskId: taskId });
    if (!task) {
      throw new NotFoundException('Task was not found');
    }

    return new TaskStatusResponseDto(task.taskId, task.status);
  }

  public async result(taskId: string): Promise<TaskResultResponseDto> {
    const task = await this.TaskRepository.findOneBy({ taskId: taskId });
    if (!task) {
      throw new NotFoundException('Task was not found');
    }

    if (!task.result) {
      throw new NotFoundException("Your isn't processed yet!");
    }

    return new TaskResultResponseDto(task.taskId, task.status, task.result);
  }
}
