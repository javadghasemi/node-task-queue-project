import { Module } from '@nestjs/common';
import { StateManagerController } from './state-manager.controller';
import { StateManagerService } from './state-manager.service';

@Module({
  controllers: [StateManagerController],
  providers: [StateManagerService]
})
export class StateManagerModule {}
