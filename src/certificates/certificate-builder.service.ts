import { Injectable, Scope } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import Handlebars from 'handlebars';
import { RendererService } from 'src/certificates/renderer.service';
import QRCode from 'qrcode';
import { Template } from 'src/templates/entities/template.entity';
import { Signature } from 'src/signatures/entities/signature.entity';
import { Logo } from 'src/logos/entities/logo.entity';
import {
  Children as StructureChildren,
  StructuresService,
} from 'src/structures/structures.service';

export type Page = {
  html: string;
  pdf: Express.Multer.File;
  png: Express.Multer.File;
};

const QR_CODE_BASE_URL = 'https://certificates.redu.digital';

@Injectable({ scope: Scope.REQUEST })
export class CertificateBuilderService {
  private template: Template;
  private validationCode: string;

  constructor(
    private readonly s3: S3Service,
    private readonly renderer: RendererService,
    private readonly structureService: StructuresService,
  ) {}

  async build(template: Template, validationCode: string) {
    this.template = template;
    this.validationCode = validationCode;

    const [front, back] = await Promise.all([
      this.generateFrontPage(),
      this.generateBackPage(),
    ]);

    return {
      front,
      back,
      merged: await this.renderer.mergePdf([front.pdf, back.pdf]),
    };
  }

  private async generateQRCode(): Promise<string> {
    const validationUrl = `${QR_CODE_BASE_URL}/${this.validationCode}`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await QRCode.toDataURL(validationUrl, {
      width: 64,
    });
  }

  private async generateFrontPage() {
    const [data, qrcode] = await Promise.all([
      this.getFrontData(),
      this.generateQRCode(),
    ]);

    const templateKey = this.template.blueprint.getS3Key('front');
    const html = await this.getHandlebarsTemplate(templateKey)
      .then((handlebars) => handlebars({ ...data, qrcode }))
      .then((html) => Handlebars.compile(html))
      .then((handlebars) => handlebars({ ...data }));

    return this.render(html);
  }

  private async generateBackPage() {
    const data = await this.getBackData();
    const templateKey =
      typeof data.content === 'string' || data.content?.childrenCount <= 16
        ? this.template.blueprint.getS3Key('backSmall')
        : this.template.blueprint.getS3Key('backLarge');

    const html = await this.getHandlebarsTemplate(templateKey).then(
      (handlebars) => handlebars(data),
    );

    return this.render(html);
  }

  private async getHandlebarsTemplate(spacesKey: string) {
    return this.s3
      .getFile(spacesKey)
      .then((file) => file?.Body?.transformToString())
      .then(Handlebars.compile);
  }

  private async render(html: string): Promise<Page> {
    const [pdf, png] = await Promise.all([
      this.renderer.pdf(html),
      this.renderer.png(html),
    ]);

    return {
      html,
      pdf,
      png,
    };
  }

  private async getFrontData() {
    const [signatures, logos, background, structure] = await Promise.all([
      this.getSignatures(),
      this.getLogos(),
      this.getBackground('front'),
      this.structureService.getReduStructure(this.template.structure),
    ]);

    // dd/mm/yyyy
    const formatDate = (date: Date) =>
      new Date(date).toLocaleDateString('pt-BR');

    return {
      title: this.template.frontData.title,
      organization: this.template.frontData.organization,
      workload: this.template.frontData.workload,
      startDate: formatDate(this.template.frontData.startDate),
      endDate: formatDate(this.template.frontData.endDate),
      info: this.template.frontData.info,
      signatures,
      logos,
      background,
      structure,
    };
  }

  private async getSignatures() {
    const buildSignature = async (s: Signature) => {
      return {
        name: s.name,
        role: s.role,
        organization: this.template.frontData.organization,
        url: await this.s3.getPresignedUrl(s.getSpacesKey()),
      };
    };

    return Promise.all(this.template.signatures.map(buildSignature));
  }

  private async getLogos() {
    const buildLogo = async (l: Logo) => {
      return {
        url: await this.s3.getPresignedUrl(l.getSpacesKey()),
      };
    };

    return Promise.all(this.template.logos.map(buildLogo));
  }

  private async getBackground(page: 'front' | 'back') {
    const kind = `${page}Background` as const;
    const key = this.template.metadata.customBackground[page]
      ? this.template.getS3Key({ kind })
      : this.template.blueprint.getS3Key(kind);

    return this.s3.getPresignedUrl(key);
  }

  private async getBackData() {
    if (!this.template.metadata.hasBackPage) return this.template.backData;

    const [background, content] = await Promise.all([
      this.getBackground('back'),
      this.getBackContent(),
    ]);

    return {
      title: this.template.backData.title,
      subtitle: this.template.backData.subtitle,
      footer: this.template.backData.footer,
      background,
      content,
    };
  }

  private async getBackContent() {
    if (this.template.metadata.hasCustomBackContent)
      return this.template.backData.content;

    const children = await this.structureService.getChildren(
      this.template.structure,
      this.template.backData.content as StructureChildren,
    );

    return {
      childrenCount: children.pagination.total_count,
      children: children.collection.map((child) => ({
        id: child.id,
        name: child.name,
        description: child.description,
      })),
    };
  }
}
