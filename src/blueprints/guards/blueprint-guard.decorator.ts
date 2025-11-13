import { UseGuards } from '@nestjs/common';
import { ManageBlueprintGuard } from 'src/blueprints/guards/manage.guard';
import { AbilityAction } from 'src/redu-api/authorization.service';

export const BlueprintGuard = (action: AbilityAction) => {
  switch (action) {
    case AbilityAction.MANAGE:
      return UseGuards(ManageBlueprintGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
