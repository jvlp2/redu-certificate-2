import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { SpacesModule } from 'src/spaces/spaces.module';
import { TemplatesModule } from 'src/templates/templates.module';
import { Template } from 'src/templates/entities/template.entity';
import { Blueprint } from 'src/blueprints/entities/blueprint.entity';

@Module({
  imports: [
    SpacesModule,
    TemplatesModule,
    TypeOrmModule.forFeature([Certificate, Template, Blueprint]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
