import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TaskClient',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbit:rabbit@localhost:5672'],
          queue: 'task_queue',
          noAck: true,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    TypeOrmModule.forFeature([Task]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
