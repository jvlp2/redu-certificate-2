import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientService } from 'src/client/client.service';
import { ReduApiService } from 'src/redu-api/redu-api.service';
import {
  Structure,
  StructureType,
} from 'src/structures/entities/structure.entity';
import { GradeType } from 'src/templates/entities/template.entity';
import { FindOneOptions, Repository } from 'typeorm';

export type Children = 'course' | 'space' | 'subject' | 'lecture';
export type StructureData = {
  id: number;
  name: string;
  description: string;
};
export type ChildrenUnitData = {
  id: number;
  name: string;
  description: string;
};
export type ChildrenData = {
  collection: ChildrenUnitData[];
  pagination: {
    total_count: number;
  };
};
export type CompletionData = {
  progress: number;
  presence: number;
  grade: number;
};
export type Paths = keyof typeof PATHS;

const PATHS = {
  environment: '/environments',
  course: '/courses',
  space: '/spaces',
  subject: '/subjects',
  lecture: '/lectures',
  completion: '/completion',
};

@Injectable()
export class StructuresService {
  constructor(
    @InjectRepository(Structure)
    private readonly structureRepository: Repository<Structure>,
    private readonly reduApi: ReduApiService,
    private readonly clientService: ClientService,
  ) {}

  async create(structureType: StructureType, structureId: number) {
    const client = await this.clientService.getClient();
    const reduStructure = await this.getReduStructure({
      structureType,
      structureId,
    });
    const structure = this.structureRepository.create({
      client,
      structureType,
      structureId,
      name: reduStructure.name,
    });
    return await this.structureRepository.save(structure);
  }

  async findOrCreate(structureType: StructureType, structureId: number) {
    try {
      return await this.findOneBy({
        where: { structureType, structureId },
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      return this.create(structureType, structureId);
    }
  }

  async findOneBy(options: FindOneOptions<Structure>) {
    const structure = await this.structureRepository.findOne(options);
    if (!structure) throw new NotFoundException('Structure not found');
    return structure;
  }

  async findOne(id: string) {
    return this.structureRepository.findOne({
      where: { id },
    });
  }

  async getReduStructure(structure: {
    structureType: StructureType;
    structureId: number;
  }) {
    const path = `${PATHS[structure.structureType]}/${structure.structureId}`;
    const url = this.reduApi.buildUrl(path);
    return await this.reduApi.get<StructureData>(url);
  }

  async getChildren(structure: Structure, children: Children) {
    const url = this.buildUrl({
      structure,
      childPath: children,
    });
    return await this.reduApi.get<ChildrenData>(url);
  }

  async getCompletion(
    structure: Structure,
    gradeType?: GradeType,
    gradeId?: number,
  ) {
    const queryParams: Record<string, string> = {};
    if (gradeType) queryParams.grade_type = gradeType;
    if (gradeId) queryParams.grade_id = gradeId.toString();
    const url = this.buildUrl({
      structure,
      childPath: 'completion',
      params: queryParams,
    });
    return await this.reduApi.get<CompletionData>(url);
  }

  private buildUrl({
    structure,
    childPath,
    params,
  }: {
    structure: Structure;
    childPath?: Paths;
    params?: Record<string, string>;
  }) {
    const apiPrefix = '/v2/certificates';
    const structureSegment = `${PATHS[structure.structureType]}/${structure.structureId}`;
    const childSegment = childPath ? PATHS[childPath] : '';

    return this.reduApi.buildUrl(
      `${apiPrefix}${structureSegment}${childSegment}`,
      params,
    );
  }
}
