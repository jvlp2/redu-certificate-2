import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

type ClientConfig = {
  baseUrl: string;
  appKey: string;
};

@Injectable({ scope: Scope.REQUEST })
export class Client {
  private readonly client: ClientConfig;
  private readonly clients: Record<string, ClientConfig> = {
    development: {
      baseUrl: 'http://localhost:3000/api',
      appKey: process.env.DEVELOPMENT_APP_KEY!,
    },
  };

  constructor(@Inject(REQUEST) private readonly request: Request) {
    const clientName = this.request.headers['x-client-name'] as string;
    if (!clientName)
      throw new BadRequestException(`Missing X-Client-Name header`);

    this.client = this.clients[clientName];
    if (!this.client)
      throw new BadRequestException(`Client ${clientName} not found`);
  }

  get baseUrl(): string {
    return this.client.baseUrl;
  }

  get appKey(): string {
    return this.client.appKey;
  }
}
