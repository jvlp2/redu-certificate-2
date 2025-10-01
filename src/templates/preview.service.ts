import { Injectable, Scope } from '@nestjs/common';
import {
  CertificateBuilderService,
  Page,
} from 'src/certificates/certificate-builder.service';
import { S3Service } from 'src/s3/s3.service';
import {
  S3KeyFormat,
  S3KeyKind,
  Template,
} from 'src/templates/entities/template.entity';
import { TemplatesService } from 'src/templates/templates.service';

@Injectable({ scope: Scope.REQUEST })
export class PreviewService {
  private template: Template;

  constructor(
    private readonly certificateBuilder: CertificateBuilderService,
    private readonly s3: S3Service,
    private readonly templatesService: TemplatesService,
  ) {}

  async preview(id: string) {
    this.template = await this.templatesService.findOne(id, {
      structure: true,
      blueprint: true,
      signatures: true,
      logos: true,
    });

    const files = await this.certificateBuilder.build(
      this.template,
      '0000000000',
    );

    await this.uploadPreviewFiles(files);
    return this.getPreviewUrls();
  }

  private async uploadPreviewFiles(files: {
    front: Page;
    back: Page;
    merged: Express.Multer.File;
  }) {
    await Promise.all([
      this.s3.uploadFile(files.front.pdf, this.getKey('front', 'pdf')),
      this.s3.uploadFile(files.front.png, this.getKey('front', 'png')),
      this.s3.uploadFile(files.back.pdf, this.getKey('back', 'pdf')),
      this.s3.uploadFile(files.back.png, this.getKey('back', 'png')),
      this.s3.uploadFile(files.merged, this.getKey('merged', 'pdf')),
    ]);
  }

  private async getPreviewUrls() {
    const [
      frontHtml,
      frontPdf,
      frontPng,
      backHtml,
      backPdf,
      backPng,
      mergedPdf,
    ] = await Promise.all([
      this.s3.getPresignedUrl(this.getKey('front', 'html')),
      this.s3.getPresignedUrl(this.getKey('front', 'pdf')),
      this.s3.getPresignedUrl(this.getKey('front', 'png')),
      this.s3.getPresignedUrl(this.getKey('back', 'html')),
      this.s3.getPresignedUrl(this.getKey('back', 'pdf')),
      this.s3.getPresignedUrl(this.getKey('back', 'png')),
      this.s3.getPresignedUrl(this.getKey('merged', 'pdf')),
    ]);

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
      merged: mergedPdf,
    };
  }

  private getKey(kind: S3KeyKind, format: S3KeyFormat) {
    return this.template.getS3Key({ kind, format, preview: true });
  }
}
