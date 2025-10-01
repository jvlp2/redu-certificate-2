import { Injectable } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { TemplatesService } from 'src/templates/templates.service';
import { SpacesService } from 'src/spaces/spaces.service';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly templatesService: TemplatesService,
  ) {}

  create(_createCertificateDto: CreateCertificateDto) {
    return 'This action creates a certificate';
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
