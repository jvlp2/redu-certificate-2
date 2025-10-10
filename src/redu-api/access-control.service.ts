import { ForbiddenException, Injectable, Scope } from '@nestjs/common';
import { ReduApiService } from 'src/redu-api/redu-api.service';

export type AuthorizeParams = {
  abilityAction: AbilityAction;
  model: Model;
  id?: string;
};
type AbilityAction = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Model =
  | 'template'
  | 'certificate'
  | 'environment'
  | 'course'
  | 'space'
  | 'blueprint';

@Injectable({ scope: Scope.REQUEST })
export class AccessControlService {
  constructor(private readonly reduApiService: ReduApiService) {}

  async authorize(authorizeParams: AuthorizeParams): Promise<void> {
    try {
      await this.reduApiService.get(this.buildUrl(authorizeParams));
    } catch {
      throw new ForbiddenException('Access denied');
    }
  }

  private buildUrl(authorizeParams: AuthorizeParams): string {
    return this.reduApiService.buildUrl('/access_control', authorizeParams);
  }
}
