import { Module } from '@nestjs/common';
import { TaskWorkerController } from './task-worker.controller';
import { TaskWorkerService } from './task-worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskProcessorListener } from './listeners/task-processor.listener';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [TaskWorkerController],
  providers: [TaskWorkerService, TaskProcessorListener],
  imports: [
    EventEmitterModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'STATE_QUEUE',
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
              queue: 'state_queue',
              noAck: true,
              queueOptions: {
                durable: true,
              },
            },
          };
        },
      },
    ]),
  ],
})
export class TaskWorkerModule {}
