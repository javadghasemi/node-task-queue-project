import { Module } from '@nestjs/common';
import { TaskWorkerController } from './task-worker.controller';
import { TaskWorkerService } from './task-worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [TaskWorkerController],
  providers: [TaskWorkerService],
  imports: [
    ClientsModule.register([
      {
        name: 'STATE_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbit:rabbit@localhost:5672'],
          queue: 'state_queue',
          noAck: true,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
})
export class TaskWorkerModule {}
