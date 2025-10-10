import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

export type AuthorizeParams = {
  abilityAction: AbilityAction;
  model: Model;
  id?: string;
};
type AbilityAction = 'create' | 'read' | 'update' | 'delete' | 'manage';
type Model =
  | 'template'
  | 'certificate'
  | 'environment'
  | 'course'
  | 'space'
  | 'blueprint';

@Injectable({ scope: Scope.REQUEST })
export class AccessControlService {
  // REFACTOR: deve ser injetado para facilitar testes
  private readonly CLIENTS: Record<
    string,
    { baseUrl: string; appKey: string }
  > = {
    development: {
      baseUrl: 'http://localhost:3000/api/access_control/certificates',
      appKey: process.env.DEVELOPMENT_APP_KEY!,
    },
    redu: {
      baseUrl: 'https://api.redu.com/api/access_control/certificates',
      appKey: process.env.REDU_APP_KEY!,
    },
  };

  private readonly baseUrl: string;
  private readonly appKey: string;
  private readonly authorizationToken: string;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    const authorizationToken = this.getHeaderValue('Authorization');
    const client = this.getClient();

    this.baseUrl = client.baseUrl;
    this.appKey = client.appKey;
    this.authorizationToken = authorizationToken;
  }

  async authorize(authorizeParams: AuthorizeParams): Promise<void> {
    console.log('authorizeParams', authorizeParams);

    const url = new URL(this.baseUrl);
    const searchParams = new URLSearchParams(authorizeParams);
    url.search = searchParams.toString();

    console.log('url', url.toString());
    console.log('authorizationToken', this.authorizationToken);
    console.log('appKey', this.appKey);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: this.authorizationToken,
        AppKey: this.appKey,
      },
    });

    console.log('response', response);

    if (!response.ok) {
      throw new ForbiddenException('Access denied');
    }
  }

  private getHeaderValue(name: string): string {
    console.log('request.headers', this.request.headers);
    const headerValue = this.request.headers[name.toLowerCase()];
    if (!headerValue) throw new BadRequestException(`Missing ${name} header`);

    if (Array.isArray(headerValue))
      throw new BadRequestException(`Multiple ${name} headers provided`);

    return headerValue;
  }

  private getClient() {
    const clientName = this.getHeaderValue('X-Client-Name');
    const client = this.CLIENTS[clientName];
    if (!client) {
      throw new BadRequestException(`Unknown client: ${clientName}`);
    }
    return client;
  }
}
