import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task';
import { Repository } from 'typeorm';
import { ChangeStateEventDto } from './dtos/change-state-event.dto';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class StateManagerService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  public changeState(data: ChangeStateEventDto, context: RmqContext) {
    console.log(data);
  }
}
