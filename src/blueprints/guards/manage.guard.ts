import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  AbilityAction,
  ReduAuthorizationService,
  Model,
} from 'src/redu-api/authorization.service';

@Injectable()
export class ManageBlueprintGuard implements CanActivate {
  constructor(
    private readonly authorizationService: ReduAuthorizationService,
  ) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    await this.authorizationService.authorize({
      abilityAction: AbilityAction.MANAGE,
      model: Model.ALL,
    });

    return true;
  }
}
