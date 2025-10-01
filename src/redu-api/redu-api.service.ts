import { ClientService } from 'src/client/client.service';
import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ReduApiService {
  private readonly authorizationToken: string;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly client: ClientService,
  ) {
    const authorization = this.request.headers['authorization'];
    if (!authorization)
      throw new BadRequestException('Authorization header is required');

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer')
      throw new BadRequestException('Invalid authorization header');
    if (!token)
      throw new BadRequestException('Authorization token is required');

    this.authorizationToken = token;
  }

  async get<T>(url: string, options?: RequestInit) {
    console.log('ReduApiService get', url);
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        ...options?.headers,
        Authorization: this.authorizationToken,
        AppKey: this.client.appKey,
      },
    });

    if (!response.ok) {
      // TODO: tratar melhor os errors (?)
      throw new Error(await response.text());
    }

    return this.toJson<T>(response);
  }

  buildUrl(path: string, queryParams?: Record<string, string>): string {
    const url = new URL(this.client.baseUrl);
    url.pathname += path;
    if (queryParams) {
      url.search = new URLSearchParams(queryParams).toString();
    }
    return url.toString();
  }

  private async toJson<T>(response: Response): Promise<T> {
    const body = await response.text();
    try {
      return JSON.parse(body) as T;
    } catch {
      return body as T;
    }
  }
}
