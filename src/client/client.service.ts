import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Repository } from 'typeorm';

type ClientConfig = {
  baseUrl: string;
  appKey: string;
};

@Injectable({ scope: Scope.REQUEST })
export class ClientService {
  readonly name: string;
  private readonly config: ClientConfig;
  private readonly clients: Record<string, ClientConfig> = {
    development: {
      baseUrl: 'http://localhost:3000/api',
      appKey: process.env.DEVELOPMENT_APP_KEY!,
    },
    avaviitra: {
      baseUrl: 'http://localhost:3000/api',
      appKey: process.env.DEVELOPMENT_APP_KEY!,
    },
    avamec: {
      baseUrl: 'https://api-avamecinterativo.cin.ufpe.br/api',
      appKey: process.env.AVAMEC_HOMOLOG_APP_KEY!,
    },
  };

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {
    this.name = this.request.headers['x-client-name'] as string;
    if (!this.name)
      throw new BadRequestException(`Missing X-Client-Name header`);

    this.config = this.clients[this.name];
    if (!this.config) throw new BadRequestException(`${this.name} not found`);
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  get appKey(): string {
    return this.config.appKey;
  }

  async getClient() {
    const client = await this.clientRepository.findOne({
      where: { name: this.name },
      relations: ['blueprint'],
    });
    if (!client) return this.create();
    return client;
  }

  async setDefaultBlueprint(blueprintId: string) {
    const client = await this.getClient();
    await this.clientRepository.update(client.id, {
      blueprint: {
        id: blueprintId,
      },
    });
  }

  async getDefaultBlueprint() {
    const client = await this.getClient();
    return client.blueprint;
  }

  private async create() {
    const client = this.clientRepository.create({
      name: this.name,
    });
    return await this.clientRepository.save(client);
  }
}
