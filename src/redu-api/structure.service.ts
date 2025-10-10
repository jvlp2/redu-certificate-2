import { Injectable, Scope } from '@nestjs/common';
import { ReduApiService } from 'src/redu-api/redu-api.service';

type structureType = 'environment' | 'course' | 'space';
type childrenType = 'space' | 'subject' | 'lecture';

const PATHS: Record<structureType | childrenType, string> = {
  environment: 'environments',
  course: 'courses',
  space: 'spaces',
  subject: 'subjects',
  lecture: 'lectures',
};

@Injectable({ scope: Scope.REQUEST })
export class StructureService {
  constructor(private readonly reduApiService: ReduApiService) {}

  async getStructure(structure: structureType, structureId: number) {
    const url = this.buildUrl(structure, structureId, '');
    return await this.reduApiService.get(url);
  }

  async getChildren(
    structure: structureType,
    structureId: number,
    childrenType: childrenType,
  ) {
    const url = this.buildUrl(structure, structureId, PATHS[childrenType]);
    return await this.reduApiService.get(url);
  }

  private buildUrl(
    structureType: structureType,
    structureId: number,
    path: string = '',
    queryParams?: Record<string, string>,
  ) {
    return this.reduApiService.buildUrl(
      `/${structureType}/${structureId}/${path}`,
      queryParams,
    );
  }
  // e mais o que for necessario para cada estrutura
}
