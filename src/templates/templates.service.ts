import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BlueprintsService } from 'src/blueprints/blueprints.service';
import { Logo } from 'src/logos/entities/logo.entity';
import { Signature } from 'src/signatures/entities/signature.entity';
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
    private blueprintsService: BlueprintsService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(body: CreateTemplateDto, backgroundImage: Express.Multer.File) {
    const blueprint = await this.blueprintsService.findOne(body.blueprintId);

    const template = this.templateRepository.create({
      id: uuidv7(),
      blueprint,
      ...body,
    });

    if (!backgroundImage) return this.templateRepository.save(template);
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
    const template = await this.findOne(id);
    if (!backgroundImage)
      return this.templateRepository.update(template.id, body);

    return this.dataSource.transaction(async (entityManager) => {
      await entityManager.update(Template, template.id, body);
      await this.spacesService.uploadFile(
        backgroundImage,
        template.getBackgroundImageSpacesKey(),
      );
    });
  }

  async delete(id: string) {
    const template = await this.findOne(id);

    return this.dataSource.transaction(async (entityManager) => {
      await entityManager.delete(Template, template.id);
      await this.spacesService.deleteFolder(template.getSpacesKey());
    });
  }

  async findOne(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async getFrontData(template: Template) {
    const [signatures, logos, backgroundImage] = await Promise.all([
      this.getSignatures(template),
      this.getLogos(template),
      this.getBackgroundImage(template),
    ]);

    return {
      ...template.frontData,
      signatures,
      logos,
      backgroundImage,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getBackData(template: Template) {
    return {
      ...template.backData,
    };
  }

  private async getSignatures(template: Template) {
    const buildSignature = async (s: Signature) => {
      return {
        name: s.name,
        role: s.role,
        organization: template.frontData.organization,
        url: await this.spacesService.getPresignedUrl(s.getSpacesKey()),
      };
    };

    return Promise.all(template.signatures.map(buildSignature));
  }

  private async getLogos(template: Template) {
    const buildLogo = async (l: Logo) => {
      return {
        url: await this.spacesService.getPresignedUrl(l.getSpacesKey()),
      };
    };

    return Promise.all(template.logos.map(buildLogo));
  }

  private async getBackgroundImage(template: Template) {
    return await this.spacesService.getPresignedUrl(
      template.getBackgroundImageSpacesKey(),
    );
  }
}
