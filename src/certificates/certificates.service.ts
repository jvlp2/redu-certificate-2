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

  async create(body: CreateCertificateDto) {
    const template = await this.templatesService.findOne(body.templateId);
    const certificate = this.certificateRepository.create({
      id: uuidv7(),
      template,
    });

    const frontHtmlKey = template.blueprint.getFrontHtmlSpacesKey();
    const frontData = await this.templatesService.getFrontData(template);
    const frontHtml = await this.getHandlebarsTemplate(frontHtmlKey)
      .then((handlebars) => handlebars(frontData))
      .then((html) => Handlebars.compile(html))
      .then((handlebars) => handlebars({ ...body }));

    // const backHtmlKey = template.blueprint.getBackSmallHtmlSpacesKey();
    // const backData = await this.templatesService.getBackData(template);
    // const backHtml = await this.getHandlebarsTemplate(backHtmlKey).then(
    //   (handlebars) => handlebars(backData),
    // );

    await this.spacesService.uploadString(
      'testeFront.html',
      frontHtml,
      'text/html',
    );
    // await this.spacesService.uploadString(
    //   'testeBack.html',
    //   backHtml,
    //   'text/html',
    // );

    return {
      front: await this.spacesService.getPresignedUrl('testeFront.html'),
      back: await this.spacesService.getPresignedUrl('testeBack.html'),
    };

    return this.certificateRepository.save(certificate);
  }

  findAll() {
    return `This action returns all certificates`;
  }

  async findOne(id: string) {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');
    return certificate;
  }

  async remove(id: string) {
    const certificate = await this.findOne(id);
    return this.certificateRepository.delete(certificate.id);
  }
}
