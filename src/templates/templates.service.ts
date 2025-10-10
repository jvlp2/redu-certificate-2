import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { SpacesService } from 'src/spaces/spaces.service';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { Template } from 'src/templates/entities/template.entity';
import { DataSource, Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly spacesService: SpacesService,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(Blueprint)
    private blueprintRepository: Repository<Blueprint>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(body: CreateTemplateDto, backgroundImage: Express.Multer.File) {
    const blueprint = await this.blueprintRepository.findOne({
      where: { id: body.blueprintId },
    });
    if (!blueprint) throw new NotFoundException('Blueprint not found');

    const template = this.templateRepository.create({
      id: uuidv7(),
      blueprint,
      ...body,
    });

    return this.spacesService
      .uploadFile(backgroundImage, template.getBackgroundImageSpacesKey())
      .then(() => this.templateRepository.save(template))
      .catch(async () => {
        await this.spacesService.deleteFile(
          template.getBackgroundImageSpacesKey(),
        );
        throw new InternalServerErrorException();
      });
  }

  async update(
    id: string,
    body: CreateTemplateDto,
    backgroundImage?: Express.Multer.File,
  ) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    if (!backgroundImage)
      return this.templateRepository.update(id, { ...body });

    return this.dataSource
      .transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.update(Template, id, {
          ...body,
        });
        await this.spacesService.uploadFile(
          backgroundImage,
          template.getBackgroundImageSpacesKey(),
        );
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
  }

  async delete(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');

    return this.dataSource
      .transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(Template, id);
        await this.spacesService.deleteFolder(template.getSpacesKey());
      })
      .catch(() => {
        throw new InternalServerErrorException();
      });
  }

  async findOne(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }
}
