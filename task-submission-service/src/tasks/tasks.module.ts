import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OutboxProcessorService } from './outbox/outbox-processor.service';
import { OutboxCronService } from './outbox/outbox-cron.service';
import { Outbox } from './entities/outbox';
import { LockService } from './lock.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TASK_QUEUE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const user = configService.get<string>('RABBITMQ_USER');
          const pass = configService.get<string>('RABBITMQ_PASS');
          const host = configService.get<string>('RABBITMQ_HOST');
          const port = configService.get<string>('RABBITMQ_PORT');

          const connectionUrl = `amqp://${user}:${pass}@${host}:${port}`;

          return {
            transport: Transport.RMQ,
            options: {
              urls: [connectionUrl],
              queue: 'task_queue',
              noAck: true,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
    TypeOrmModule.forFeature([Task, Outbox]),
  ],
  providers: [
    TasksService,
    OutboxProcessorService,
    OutboxCronService,
    LockService,
  ],
  controllers: [TasksController],
  exports: [TasksService, OutboxProcessorService],
})
export class TasksModule {}
