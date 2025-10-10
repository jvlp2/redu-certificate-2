import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { SpacesModule } from 'src/spaces/spaces.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from 'src/templates/entities/template.entity';
import { BlueprintsModule } from 'src/blueprints/blueprints.module';
import { AccessControlModule } from 'src/access-control/access-control.module';

@Module({
  imports: [
    AccessControlModule,
    SpacesModule,
    TypeOrmModule.forFeature([Template]),
    BlueprintsModule,
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
