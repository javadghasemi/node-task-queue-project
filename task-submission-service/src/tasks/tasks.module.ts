import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task';
import { ConfigModule, ConfigService } from '@nestjs/config';

const env = process.env;

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TaskClient',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const user = configService.get<string>('RABBITMQ_USER');
          const pass = configService.get<string>('RABBITMQ_PASS');
          const host = configService.get<string>('RABBITMQ_HOST');
          const port = configService.get<string>('RABBITMQ_PORT');

          return {
            transport: Transport.RMQ,
            options: {
              urls: [`amqp://${user}:${pass}@${host}:${port}`],
              queue: 'task_queue',
              noAck: true,
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),
    TypeOrmModule.forFeature([Task]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
