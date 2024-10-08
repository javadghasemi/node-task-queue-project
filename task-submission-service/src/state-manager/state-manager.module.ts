import { Module } from '@nestjs/common';
import { StateManagerController } from './state-manager.controller';
import { StateManagerService } from './state-manager.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  controllers: [StateManagerController],
  providers: [StateManagerService],
  imports: [TasksModule, TypeOrmModule.forFeature([Task])],
})
export class StateManagerModule {}
