import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { CreateTaskRequestDto } from './dtos/create-task-request.dto';
import { CreateTaskResponseDto } from './dtos/create-task-response.dto';
import { TaskStatusResponseDto } from './dtos/task-status-response.dto';
import { TaskResultResponseDto } from './dtos/task-result-response.dto';

import { Task } from './entities/task';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Outbox } from './entities/outbox';

@Injectable()
export class TasksService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  public async create(
    createTaskDto: CreateTaskRequestDto,
  ): Promise<CreateTaskResponseDto> {
    this.logger.info('Creating a new task', { createTaskDto });

    const taskData = this.serializeTaskData(createTaskDto.data);

    try {
      const task = this.taskRepository.create({
        taskId: uuid(),
        data: taskData,
        status: TaskStatusEnum.Pending,
        type: createTaskDto.type,
      });

      await this.taskRepository.manager.transaction(
        async (entityManager: EntityManager) => {
          await entityManager.save(Task, task);

          this.logger.info('Task created and pending for outbox', {
            taskId: task.taskId,
            status: task.status,
          });

          const outbox = this.outboxRepository.create({
            taskId: task.taskId,
            status: TaskStatusEnum.Pending,
          });

          await entityManager.save(Outbox, outbox);

          this.logger.info('Outbox created and wait for queue', {
            taskId: task.taskId,
            outboxId: outbox.id,
            status: task.status,
          });
        },
      );

      return new CreateTaskResponseDto(
        task.taskId,
        TaskStatusEnum.Queued,
        'Task queued successfully',
      );
    } catch (error) {
      this.logger.error('Error occurred while creating task', {
        error: error.message,
      });
      throw error;
    }
  }

  public async status(taskId: string): Promise<TaskStatusResponseDto> {
    this.logger.debug('Fetching status for task', { taskId });

    const task = await this.findTaskOrThrow(taskId);

    this.logger.info('Task status fetched successfully', {
      taskId: task.taskId,
      status: task.status,
    });

    return new TaskStatusResponseDto(
      task.taskId,
      task.status,
      task.createdAt,
      task.updatedAt,
    );
  }

  public async result(taskId: string): Promise<TaskResultResponseDto> {
    this.logger.debug('Fetching result for task', { taskId });

    const task = await this.findTaskOrThrow(taskId);

    if (!task.result) {
      this.logger.error('Result not found for task', { taskId });
      throw new NotFoundException("Task isn't processed yet!");
    }

    this.logger.info('Task result fetched successfully', { taskId });

    return new TaskResultResponseDto(
      task.taskId,
      task.status,
      task.result,
      task.createdAt,
      task.updatedAt,
    );
  }

  public async updateStatus(
    taskId: string,
    status: TaskStatusEnum,
  ): Promise<void> {
    this.logger.debug('Updating status for task', { taskId, status });

    await this.findTaskOrThrow(taskId);
    await this.taskRepository.update({ taskId }, { status });

    this.logger.info('Task status updated', { taskId, status });
  }

  public async addResult(taskId: string, result: any): Promise<void> {
    this.logger.debug('Adding result for task', { taskId, result });

    await this.findTaskOrThrow(taskId);
    await this.taskRepository.update(
      { taskId },
      { status: TaskStatusEnum.Completed, result },
    );

    this.logger.info('Task result added', {
      taskId,
      status: TaskStatusEnum.Completed,
    });
  }

  private async findTaskOrThrow(taskId: string): Promise<Task> {
    this.logger.debug('Looking up task', { taskId });

    const task = await this.taskRepository.findOneBy({ taskId });
    if (!task) {
      this.logger.error('Task not found', { taskId });
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
      status: TaskStatusEnum.Queued,
      type: createTaskDto.type,
    });

    this.logger.debug('Saving task to the database', { task });

    return this.taskRepository.save(task);
  }
}
