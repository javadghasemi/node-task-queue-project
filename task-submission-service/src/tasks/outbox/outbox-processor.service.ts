import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as crypto from 'crypto';

import { Outbox } from '../entities/outbox';
import { Task } from '../entities/task';
import { TaskStatusEnum } from '../../enums/task-status.enum';
import { LockService } from '../lock.service';

@Injectable()
export class OutboxProcessorService {
  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject('TASK_QUEUE')
    private readonly taskQueueClient: ClientProxy,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly lockService: LockService,
  ) {}

  public async processOutboxPendingEntries() {
    const pendingOutboxQuery = `SELECT * FROM "outbox" WHERE "status" = $1 FOR UPDATE SKIP LOCKED LIMIT 10`;
    const pendingOutboxEntries = await this.outboxRepository.query(
      pendingOutboxQuery,
      [TaskStatusEnum.Pending],
    );

    if (!pendingOutboxEntries.length) return;

    for (const outbox of pendingOutboxEntries) {
      const taskLockId = this.getTaskLockIdFromUUID(outbox.taskId);
      const lockAcquired = await this.lockService.acquireLock(taskLockId);

      if (!lockAcquired) {
        this.logger.warn(`Skipping task ${outbox.taskId}, already locked.`);
        continue;
      }

      try {
        await this.processTask(outbox);
      } catch (error) {
        this.logger.error(`Error processing task ${outbox.taskId}:`, error);
        throw error;
      } finally {
        await this.lockService.releaseLock(taskLockId);
      }
    }
  }

  public async updateOutboxStatus(taskId: string, status: TaskStatusEnum) {
    await this.outboxRepository.update({ taskId }, { status });
  }

  private async processTask(outbox: Outbox): Promise<void> {
    await this.outboxRepository.manager.transaction(
      async (entityManager: EntityManager) => {
        const task = await entityManager.findOne(Task, {
          where: { taskId: outbox.taskId },
        });

        if (!task) {
          this.logger.error(`Task ${outbox.taskId} not found.`);
          return;
        }

        if (task.status === TaskStatusEnum.Queued) {
          this.logger.warn(`Task ${task.taskId} is already queued.`);
          return;
        }

        task.status = TaskStatusEnum.Queued;
        await entityManager.save(Task, task);

        outbox.status = TaskStatusEnum.Queued;
        await entityManager.save(Outbox, outbox);
      },
    );

    const recheckedTask = await this.taskRepository.findOne({
      where: { taskId: outbox.taskId },
    });
    if (recheckedTask?.status === TaskStatusEnum.Queued) {
      await this.emitTaskForProcessing(recheckedTask);
    }
  }

  private async emitTaskForProcessing(task: Task): Promise<void> {
    this.logger.debug('Emitting task for processing', { taskId: task.taskId });

    try {
      await lastValueFrom(
        this.taskQueueClient.emit('process', {
          taskId: task.taskId,
          data: task.data,
          type: task.type,
          status: task.status,
        }),
      );
      this.logger.info('Task emitted for processing', { taskId: task.taskId });
    } catch (error) {
      this.logger.error(`Failed to emit task ${task.taskId}:`, error);
      throw error;
    }
  }

  private getTaskLockIdFromUUID(uuid: string): [number, number] {
    const hash = crypto.createHash('sha256').update(uuid).digest('hex');
    const lockId = BigInt('0x' + hash.slice(0, 16));
    const upper32 = Number(lockId >> BigInt(32)) & 0xffffffff;
    const lower32 = Number(lockId & BigInt(0xffffffff));
    return [upper32 % 2147483648, lower32 % 2147483648];
  }
}
