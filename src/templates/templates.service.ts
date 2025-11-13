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
import { Back, Template } from 'src/templates/entities/template.entity';
import {
  DataSource,
  FindOneOptions,
  FindOptionsRelations,
  Repository,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { i18n } from 'src/i18n';

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
    const template = await this.findOne(id, { logos: true, signatures: true });
    if (template.finished) return;

    if (template.logos.length > 3)
      throw new BadRequestException(i18n.t('validation.MAX_LOGOS'));
    if (template.signatures.length < 1 || template.signatures.length > 3)
      throw new BadRequestException(i18n.t('validation.MAX_SIGNATURES'));

    await this.templateRepository.update(id, {
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
    const template = await this.findOrInitialize(
      body,
      structureType,
      structureId,
      frontBackground,
      backBackground,
    );

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
      await this.templateRepository.update(template.id, {
        ...body,
        back: body.back as Back,
      });
    } else {
      await this.dataSource.transaction(async (entityManager) => {
        await entityManager.update(Template, template.id, {
          ...body,
          back: body.back as Back,
        });
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

  async findOrInitialize(
    body: CreateTemplateDto,
    structureType: StructureType,
    structureId: number,
    frontBackground: Express.Multer.File,
    backBackground: Express.Multer.File,
  ) {
    try {
      const template = await this.findOneByStructure(
        structureType,
        structureId,
      );
      await this.templateRepository.update(template.id, {
        ...body,
        back: body.back as Back,
      });
      return template;
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;

      const blueprint = await this.clientService.getDefaultBlueprint();
      const structure = await this.structureService.findOrCreate(
        structureType,
        structureId,
      );

      return this.templateRepository.create({
        ...body,
        id: uuidv7(),
        blueprint,
        structure,
        metadata: {
          hasBackPage: Boolean(body.back?.content),
          customBackground: {
            front: Boolean(frontBackground),
            back: Boolean(backBackground),
          },
        },
      });
    }
  }

  async findOne(id: string, relations?: FindOptionsRelations<Template>) {
    return this.findOneBy({ where: { id }, relations });
  }

  async findOneBy(options: FindOneOptions<Template>) {
    const template = await this.templateRepository.findOne(options);
    if (!template)
      throw new NotFoundException(i18n.t('error.NOT_FOUND.TEMPLATE'));
    return template;
  }

  async findOneByStructure(
    structureType: StructureType,
    structureId: number,
    options?: {
      finished?: boolean;
      relations?: FindOptionsRelations<Template>;
    },
  ) {
    return this.findOneBy({
      where: {
        structure: {
          structureType,
          structureId,
        },
        finished: options?.finished,
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
