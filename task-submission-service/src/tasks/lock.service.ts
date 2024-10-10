import { Outbox } from './entities/outbox';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LockService {
  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  public async acquireLock(lockId: [number, number]): Promise<boolean> {
    const query = `SELECT pg_try_advisory_lock($1, $2)`;
    const result = await this.outboxRepository.query(query, lockId);
    return result[0].pg_try_advisory_lock;
  }

  public async releaseLock(lockId: [number, number]): Promise<void> {
    const query = `SELECT pg_advisory_unlock($1, $2)`;
    await this.outboxRepository.query(query, lockId);
  }
}
