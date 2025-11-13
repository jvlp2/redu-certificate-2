import { UseGuards } from '@nestjs/common';
import { AbilityAction } from 'src/redu-api/authorization.service';
import { ManageTemplateGuard } from 'src/templates/guards/manage.guard';
import { ReadTemplateGuard } from 'src/templates/guards/read.guard';

export const TemplateGuard = (action: AbilityAction) => {
  switch (action) {
    case AbilityAction.READ:
      return UseGuards(ReadTemplateGuard);
    case AbilityAction.MANAGE:
      return UseGuards(ManageTemplateGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
