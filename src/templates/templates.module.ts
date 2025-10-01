import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { SpacesModule } from 'src/spaces/spaces.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from 'src/templates/entities/template.entity';
import { Blueprint } from 'src/blueprints/entities/blueprint.entity';

@Module({
  imports: [SpacesModule, TypeOrmModule.forFeature([Template, Blueprint])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
