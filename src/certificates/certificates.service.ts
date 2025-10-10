import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { TemplatesService } from 'src/templates/templates.service';
import { SpacesService } from 'src/spaces/spaces.service';
import { Certificate } from './entities/certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import Handlebars from 'handlebars';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly templatesService: TemplatesService,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  private async getHandlebarsTemplate(spacesKey: string) {
    return this.spacesService
      .getFile(spacesKey)
      .then((file) => file?.Body?.transformToString())
      .then((html) => Handlebars.compile(html))
      .catch(() => {
        throw new NotFoundException('blueprint HTML not found');
      });
  }

  async create(createCertificateDto: CreateCertificateDto) {
    const template = await this.templatesService.findOne(
      createCertificateDto.templateId,
    );

    const certificate = this.certificateRepository.create({
      id: uuidv7(),
      template,
    });

    let frontHandlebars = await this.getHandlebarsTemplate(
      template.blueprint.getFrontHtmlSpacesKey(),
    );
    let frontHtml = frontHandlebars({
      ...template.frontData,
      signatures: template.signatures.map(async (signature) => ({
        name: signature.name,
        role: signature.role,
        organization: template.frontData.organization,
        url: await this.spacesService.getPresignedUrl(signature.getSpacesKey()),
      })),
      logos: template.logos.map(async (logo) => ({
        url: await this.spacesService.getPresignedUrl(logo.getSpacesKey()),
      })),
      backgroundImage: await this.spacesService.getPresignedUrl(
        template.getBackgroundImageSpacesKey(),
      ),
    });

    frontHandlebars = Handlebars.compile(frontHtml);
    frontHtml = frontHandlebars({
      ...createCertificateDto,
    });

    return this.certificateRepository.save(certificate);
  }

  findAll() {
    return `This action returns all certificates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} certificate`;
  }

  remove(id: number) {
    return `This action removes a #${id} certificate`;
  }
}
