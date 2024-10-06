import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/entities/task';
import { StateManagerModule } from './state-manager/state-manager.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'task_queue_project',
      synchronize: true,
      entities: [Task],
    }),
    TasksModule,
    StateManagerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
