import { Injectable } from '@nestjs/common';
import { OutboxProcessorService } from './outbox-processor.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OutboxCronService {
  constructor(
    private readonly outboxProcessorService: OutboxProcessorService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleOutboxProcessing() {
    await this.outboxProcessorService.processOutboxPendingEntries();
  }
}
