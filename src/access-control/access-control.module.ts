import { Module } from '@nestjs/common';
import { AccessControlService } from 'src/access-control/access-control.service';

@Module({
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
