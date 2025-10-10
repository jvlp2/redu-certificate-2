import { Module } from '@nestjs/common';
import { AccessControlService } from 'src/redu-api/access-control.service';
import { Client } from 'src/redu-api/client';
import { ReduApiService } from 'src/redu-api/redu-api.service';

@Module({
  providers: [AccessControlService, Client, ReduApiService],
  exports: [AccessControlService],
})
export class ReduApiModule {}

// TODO: refatorar esse módulo. O módulo deve ser responsável por buscar as informações na api principal, não apenas autorização.
// 1. achar outro nome. (Ok)
// 2. serviço de autorização (Ok)
// TODO 3. serviço que busca informações da estrutura na api principal: nome, número de disciplinas/módulos/mídias, nome das sub-estruturas, etc.
