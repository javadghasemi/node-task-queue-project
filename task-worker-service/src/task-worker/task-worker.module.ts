import { Module } from '@nestjs/common';
import { TaskWorkerController } from './task-worker.controller';
import { TaskWorkerService } from './task-worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskProcessorListener } from './listeners/task-processor.listener';

@Module({
  controllers: [TaskWorkerController],
  providers: [TaskWorkerService, TaskProcessorListener],
  imports: [
    EventEmitterModule.forRoot(),
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
