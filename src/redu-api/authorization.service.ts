import { ForbiddenException, Injectable, Scope } from '@nestjs/common';
import { ReduApiService } from 'src/redu-api/redu-api.service';

export type AuthorizeParams = {
  abilityAction: AbilityAction;
  model: Model;
  id?: string;
};

export enum Model {
  TEMPLATE = 'template',
  CERTIFICATE = 'certificate',
  ENVIRONMENT = 'environment',
  COURSE = 'course',
  SPACE = 'space',
  BLUEPRINT = 'blueprint',
  USER = 'user',
  ALL = 'all',
}

export enum AbilityAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

@Injectable({ scope: Scope.REQUEST })
export class ReduAuthorizationService {
  constructor(private readonly reduApiService: ReduApiService) {}

  async authorize(authorizeParams: AuthorizeParams): Promise<void> {
    console.log('authorize', authorizeParams);
    try {
      await this.reduApiService.get(this.buildUrl(authorizeParams));
    } catch {
      throw new ForbiddenException('Access denied');
    }
  }

  private buildUrl(authorizeParams: AuthorizeParams): string {
    return this.reduApiService.buildUrl(
      '/v2/certificates/authorization',
      authorizeParams,
    );
  }
}
