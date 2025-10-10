import { Client } from 'src/redu-api/client';
import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ReduApiService {
  private readonly authorizationToken: string;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly client: Client,
  ) {
    this.authorizationToken = this.request.headers['authorization'] ?? '';
  }

  async get<T>(url: string, options?: RequestInit) {
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

    return (await response.json()) as T;
  }

  buildUrl(path: string, queryParams?: Record<string, string>): string {
    const url = new URL(this.client.baseUrl);
    url.pathname = path;
    if (queryParams) {
      url.search = new URLSearchParams(queryParams).toString();
    }
    return url.toString();
  }
}
