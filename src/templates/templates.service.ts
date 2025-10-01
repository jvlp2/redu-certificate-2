import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ClientService } from 'src/client/client.service';
import { S3Service } from 'src/s3/s3.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { StructuresService } from 'src/structures/structures.service';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { Template } from 'src/templates/entities/template.entity';
import {
  DataSource,
  FindOneOptions,
  FindOptionsRelations,
  Repository,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

const BACK_CONTENT = ['course', 'space', 'subject', 'lecture'];

@Injectable()
export class TemplatesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    private readonly clientService: ClientService,
    private readonly structureService: StructuresService,
    private readonly s3: S3Service,
  ) {}

  async finish(id: string) {
    const template = await this.findOne(id, {
      logos: true,
      signatures: true,
    });
    if (template.finished) return;

    if (template.logos.length > 3)
      throw new BadRequestException('Template must have at most 3 logos');
    if (template.signatures.length < 1 || template.signatures.length > 3)
      throw new BadRequestException(
        'Template must have between 1 and 3 signatures',
      );

    return await this.templateRepository.update(id, {
      finished: true,
    });
  }

  async create(
    body: CreateTemplateDto,
    structureType: StructureType,
    structureId: number,
    frontBackground: Express.Multer.File,
    backBackground: Express.Multer.File,
  ) {
    const client = await this.clientService.getClient();
    const blueprint = client.blueprint;
    const structure = await this.structureService.findOrCreate(
      structureType,
      structureId,
    );
    const template = this.templateRepository.create({
      ...body,
      id: uuidv7(),
      blueprint,
      structure,
      metadata: {
        hasBackPage: Boolean(body.backData.content),
        customBackground: {
          front: Boolean(frontBackground),
          back: Boolean(backBackground),
        },
        hasCustomBackContent: Boolean(
          body.backData?.content &&
            !BACK_CONTENT.includes(body.backData.content),
        ),
      },
    });

    if (!frontBackground && !backBackground)
      return this.templateRepository.save(template);

    try {
      return await this.dataSource.transaction(async (entityManager) => {
        await entityManager.save(template);
        await this.uploadBackground(template, 'front', frontBackground);
        await this.uploadBackground(template, 'back', backBackground);

        return template;
      });
    } catch (error) {
      await this.s3.deleteFolder(template.folderKey);
      throw error;
    }
  }

  async update(
    id: string,
    body: CreateTemplateDto,
    frontBackground?: Express.Multer.File,
    backBackground?: Express.Multer.File,
  ) {
    const template = await this.findOne(id);

    if (!frontBackground && !backBackground) {
      await this.templateRepository.update(template.id, body);
    } else {
      await this.dataSource.transaction(async (entityManager) => {
        await entityManager.update(Template, template.id, body);
        await this.uploadBackground(template, 'front', frontBackground);
        await this.uploadBackground(template, 'back', backBackground);
      });
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const template = await this.findOne(id);

    return this.dataSource.transaction(async (entityManager) => {
      await entityManager.delete(Template, template.id);
      await this.s3.deleteFolder(template.folderKey);
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Template>) {
    return this.findOneBy({ where: { id }, relations });
  }

  async findOneBy(options: FindOneOptions<Template>) {
    const template = await this.templateRepository.findOne(options);
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async findOneByStructure(
    structureType: StructureType,
    structureId: number,
    options?: {
      relations?: FindOptionsRelations<Template>;
    },
  ) {
    return this.findOneBy({
      where: {
        structure: {
          structureType,
          structureId,
        },
      },
      relations: options?.relations,
    });
  }

  private async uploadBackground(
    template: Template,
    kind: 'front' | 'back',
    file?: Express.Multer.File,
  ) {
    if (!file) return;
    const key = template.getS3Key({ kind: `${kind}Background` });
    return this.s3.uploadFile(file, key);
  }
}
