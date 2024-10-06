import { Controller } from '@nestjs/common';
import { StateManagerService } from './state-manager.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ChangeStateEventDto } from './dtos/change-state-event.dto';

@Controller('state-manager')
export class StateManagerController {
  constructor(private readonly stateManagerService: StateManagerService) {}

  @MessagePattern('change_state')
  public changeState(
    @Payload() data: ChangeStateEventDto,
    @Ctx() context: RmqContext,
  ) {
    return this.stateManagerService.changeState(data, context);
  }
}
