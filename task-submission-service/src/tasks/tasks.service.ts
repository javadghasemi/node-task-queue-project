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
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  public async create(
    createTaskDto: CreateTaskRequestDto,
  ): Promise<CreateTaskResponseDto> {
    let taskData = createTaskDto.data;

    if (typeof taskData === 'object') {
      taskData = JSON.stringify(taskData);
    }

    const task = this.taskRepository.create({
      taskId: uid(),
      data: taskData,
      status: TaskStatus.Queued,
      type: createTaskDto.type,
    });

    await this.taskRepository.save(task);

    await lastValueFrom(
      this.TaskQueueClient.emit('process', {
        taskId: task.taskId,
        data: task.data,
        type: task.type,
        status: task.status,
      }),
    );

    await this.taskRepository.update(task.id, { submitted: true });

    return new CreateTaskResponseDto(
      task.taskId,
      TaskStatus.Queued,
      'Task queued successfully',
    );
  }

  public async status(taskId: string): Promise<TaskStatusResponseDto> {
    const task = await this.taskRepository.findOneBy({ taskId: taskId });
    if (!this.isTaskExists(task)) {
      throw new NotFoundException('Task was not found');
    }

    return new TaskStatusResponseDto(
      task.taskId,
      task.status,
      task.createdAt,
      task.updatedAt,
    );
  }

  public async result(taskId: string): Promise<TaskResultResponseDto> {
    const task = await this.taskRepository.findOneBy({ taskId: taskId });
    if (!this.isTaskExists(task)) {
      throw new NotFoundException('Task was not found');
    }

    if (!this.isTaskResultExists(task)) {
      throw new NotFoundException("Your isn't processed yet!");
    }

    return new TaskResultResponseDto(
      task.taskId,
      task.status,
      task.result,
      task.createdAt,
      task.updatedAt,
    );
  }

  public async updateStatus(taskId: string, status: TaskStatus) {
    const task = await this.taskRepository.findOneBy({ taskId: taskId });
    if (!this.isTaskExists(task)) {
      throw new NotFoundException('Task was not found');
    }

    await this.taskRepository.update({ taskId }, { status });
  }

  public async addResult(taskId: string, result: any) {
    const task = await this.taskRepository.findOneBy({ taskId: taskId });
    if (!this.isTaskExists(task)) {
      throw new NotFoundException('Task was not found');
    }

    await this.taskRepository.update(
      { taskId },
      { status: 'completed', result },
    );
  }

  private isTaskExists(task: Task): boolean {
    return Boolean(task);
  }

  private isTaskResultExists(task: Task): boolean {
    return !!task?.result;
  }
}
