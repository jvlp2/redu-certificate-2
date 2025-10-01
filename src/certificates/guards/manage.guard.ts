import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  AbilityAction,
  ReduAuthorizationService,
  Model,
} from 'src/redu-api/authorization.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ManageCertificateGuard implements CanActivate {
  constructor(
    private readonly authorizationService: ReduAuthorizationService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { id } = request.params as { id: string };
    const { reduUserId } = await this.usersService.findOneBy({
      where: { certificates: { id } },
    });

    await this.authorizationService.authorize({
      abilityAction: AbilityAction.MANAGE,
      model: Model.USER,
      id: reduUserId.toString(),
    });

    return true;
  }
}
