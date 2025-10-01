import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import {
  Certificate,
  S3KeyFormat,
  S3KeyOptions,
} from './entities/certificate.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOneOptions,
  FindOptionsRelations,
  Repository,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import {
  CertificateBuilderService,
  type Page,
} from 'src/certificates/certificate-builder.service';
import { Template } from 'src/templates/entities/template.entity';
import { RequirementsService } from 'src/certificates/requirements.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { TemplatesService } from 'src/templates/templates.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    private readonly s3: S3Service,
    private readonly usersService: UsersService,
    private readonly certificateBuilder: CertificateBuilderService,
    private readonly requirements: RequirementsService,
    private readonly templatesService: TemplatesService,
  ) {}

  async create(structureType: StructureType, structureId: number) {
    const template = await this.templatesService.findOneByStructure(
      structureType,
      structureId,
      {
        relations: {
          structure: true,
          logos: true,
          signatures: true,
          blueprint: true,
        },
      },
    );

    const certificate = await this.initCertificate(template);
    const files = await this.certificateBuilder.build(
      template,
      certificate.validationCode,
    );
    await this.uploadCertificate(certificate, files);
    await this.certificateRepository.save(certificate);
    return this.getUrls(certificate);
  }

  async findAll() {
    const { id: reduUserId } = await this.usersService.reduUser();

    const certificates = await this.certificateRepository.find({
      where: { user: { reduUserId } },
      relations: { template: { structure: true } },
    });

    return Promise.all(
      certificates.map(async (certificate) => ({
        id: certificate.id,
        validationCode: certificate.validationCode,
        createdAt: certificate.createdAt,
        urls: await this.getUrls(certificate),
        structure: {
          type: certificate.template.structure.structureType,
          id: certificate.template.structure.structureId,
          name: certificate.template.structure.name,
        },
      })),
    );
  }

  async findOne(id: string) {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');
    return certificate;
  }

  async findOneByTemplate(
    template: Template,
    options?: {
      reduUserId?: number;
      relations?: FindOptionsRelations<Certificate>;
    },
  ) {
    const reduUserId =
      options?.reduUserId ?? (await this.usersService.reduUser()).id;
    return this.findOneBy({
      where: {
        user: { reduUserId },
        template: { id: template.id },
      },
      relations: options?.relations,
    });
  }

  async findOneBy(options: FindOneOptions<Certificate>) {
    const certificate = await this.certificateRepository.findOne(options);
    if (!certificate) throw new NotFoundException('Certificate not found');
    return certificate;
  }

  async getCertificateInfo(structureType: StructureType, structureId: number) {
    const template = await this.templatesService.findOneByStructure(
      structureType,
      structureId,
    );
    const canGenerate = await this.requirements.canGenerate(template);
    return this.findOneByTemplate(template)
      .then(async (certificate) => ({
        canGenerate,
        outdated: template.updatedAt > certificate?.createdAt,
        requirements: template.requirements,
        urls: await this.getUrls(certificate),
      }))
      .catch(() => ({
        canGenerate,
        outdated: false,
        requirements: template.requirements,
        urls: null,
      }));
  }

  async remove(id: string) {
    const certificate = await this.findOne(id);
    return this.dataSource.transaction(async (entityManager) => {
      await entityManager.delete(Certificate, certificate.id);
      await this.s3.deleteFolder(certificate.folderKey);
    });
  }

  private async initCertificate(template: Template) {
    const reduUser = await this.usersService.reduUser();
    const user = await this.usersService.findOrCreate(reduUser);

    await this.findOneByTemplate(template, { reduUserId: reduUser.id })
      .then((certificate) => this.remove(certificate.id))
      .catch(() => {});

    const certificate = this.certificateRepository.create({
      id: uuidv7(),
      template,
      user,
    });

    return this.generateValidationCode(certificate);
  }

  private async generateValidationCode(certificate: Certificate) {
    certificate.generateValidationCode();
    while (
      await this.certificateRepository.findOne({
        where: { validationCode: certificate.validationCode },
      })
    ) {
      certificate.generateValidationCode();
    }
    return this.certificateRepository.save(certificate);
  }

  private async uploadCertificate(
    certificate: Certificate,
    files: {
      front: Page;
      back: Page;
      merged: Express.Multer.File;
    },
  ) {
    const [front, back, merged] = await Promise.all([
      this.uploadPage(certificate, 'front', files.front),
      this.uploadPage(certificate, 'back', files.back),
      this.s3.uploadFile(
        files.merged,
        certificate.getS3Key({ kind: 'merged', format: 'pdf' }),
      ),
    ]);

    return {
      front,
      back,
      merged,
    };
  }

  private async uploadPage(
    certificate: Certificate,
    kind: 'front' | 'back',
    page: Page,
  ) {
    const key = (format: S3KeyFormat) => certificate.getS3Key({ kind, format });

    await Promise.all([
      this.s3.uploadFile(page.pdf, key('pdf')),
      this.s3.uploadFile(page.png, key('png')),
      this.s3.uploadString(page.html, key('html'), 'text/html'),
    ]);
  }

  private async getUrls(certificate: Certificate) {
    const [
      frontHtml,
      frontPdf,
      frontPng,
      backHtml,
      backPdf,
      backPng,
      mergedPdf,
    ] = await Promise.all(
      [
        { kind: 'front', format: 'html' },
        { kind: 'front', format: 'pdf' },
        { kind: 'front', format: 'png' },
        { kind: 'back', format: 'html' },
        { kind: 'back', format: 'pdf' },
        { kind: 'back', format: 'png' },
        { kind: 'merged', format: 'pdf' },
      ].map((options: S3KeyOptions) => {
        const key = certificate.getS3Key(options);
        return this.s3.getPresignedUrl(key);
      }),
    );

    return {
      front: {
        html: frontHtml,
        pdf: frontPdf,
        png: frontPng,
      },
      back: {
        html: backHtml,
        pdf: backPdf,
        png: backPng,
      },
      merged: {
        pdf: mergedPdf,
      },
    };
  }
}
