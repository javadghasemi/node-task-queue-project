import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { lastValueFrom } from 'rxjs';

import { CreateTaskRequestDto } from './dtos/create-task-request.dto';
import { CreateTaskResponseDto } from './dtos/create-task-response.dto';
import { TaskStatusResponseDto } from './dtos/task-status-response.dto';
import { TaskResultResponseDto } from './dtos/task-result-response.dto';

import { Task } from './entities/task';
import { TaskStatus } from './enums/TaskStatus';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TaskClient') private readonly taskQueueClient: ClientProxy,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  public async create(
    createTaskDto: CreateTaskRequestDto,
  ): Promise<CreateTaskResponseDto> {
    const taskData = this.serializeTaskData(createTaskDto.data);
    const task = await this.createAndSaveTask(createTaskDto, taskData);

    await this.emitTaskForProcessing(task);
    await this.markTaskAsSubmitted(task.id);

    return new CreateTaskResponseDto(
      task.taskId,
      TaskStatus.Queued,
      'Task queued successfully',
    );
  }

  public async status(taskId: string): Promise<TaskStatusResponseDto> {
    const task = await this.findTaskOrThrow(taskId);

    return new TaskStatusResponseDto(
      task.taskId,
      task.status,
      task.createdAt,
      task.updatedAt,
    );
  }

  public async result(taskId: string): Promise<TaskResultResponseDto> {
    const task = await this.findTaskOrThrow(taskId);

    if (!task.result) {
      throw new NotFoundException("Task isn't processed yet!");
    }

    return new TaskResultResponseDto(
      task.taskId,
      task.status,
      task.result,
      task.createdAt,
      task.updatedAt,
    );
  }

  public async updateStatus(taskId: string, status: TaskStatus): Promise<void> {
    await this.findTaskOrThrow(taskId);

    await this.taskRepository.update({ taskId }, { status });
  }

  public async addResult(taskId: string, result: any): Promise<void> {
    await this.findTaskOrThrow(taskId);

    await this.taskRepository.update(
      { taskId },
      { status: TaskStatus.Completed, result },
    );
  }

  private async findTaskOrThrow(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ taskId });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private serializeTaskData(data: any): string {
    return typeof data === 'object' ? JSON.stringify(data) : data;
  }

  private async createAndSaveTask(
    createTaskDto: CreateTaskRequestDto,
    taskData: string,
  ): Promise<Task> {
    const task = this.taskRepository.create({
      taskId: uuid(),
      data: taskData,
      status: TaskStatus.Queued,
      type: createTaskDto.type,
    });
    return this.taskRepository.save(task);
  }

  private async emitTaskForProcessing(task: Task): Promise<void> {
    await lastValueFrom(
      this.taskQueueClient.emit('process', {
        taskId: task.taskId,
        data: task.data,
        type: task.type,
        status: task.status,
      }),
    );
  }

  private async markTaskAsSubmitted(taskId: number): Promise<void> {
    await this.taskRepository.update(taskId, { submitted: true });
  }
}
