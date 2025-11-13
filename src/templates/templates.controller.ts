import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Delete,
  Get,
} from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { templateSchema } from 'src/templates/dto/template-schema';
import { TemplatesService } from 'src/templates/templates.service';
import { PreviewService } from 'src/templates/preview.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { TemplateGuard } from 'src/templates/guards/template.guard';
import { AbilityAction } from 'src/redu-api/authorization.service';
import { TemplateFilesInterceptor } from 'src/templates/decorators/template-files-interceptor.decorator';
import { TemplateFiles } from 'src/templates/decorators/template-files.decorators';
import { ApiAuth } from 'src/decorators/swagger/api-auth.decorator';
import { ApiStructureTypeIdParam } from 'src/decorators/swagger';

@Controller('templates')
@ApiAuth()
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly previewService: PreviewService,
  ) {}

  @Post(':structureType/:structureId')
  @TemplateGuard(AbilityAction.MANAGE)
  @TemplateFilesInterceptor()
  @ApiBody({ type: templateSchema })
  @ApiConsumes('multipart/form-data')
  @ApiStructureTypeIdParam()
  async create(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
    @Body() body: CreateTemplateDto,
    @TemplateFiles() files: TemplateFiles,
  ) {
    return this.templatesService.create(
      body,
      structureType,
      structureId,
      files.frontBackground,
      files.backBackground,
    );
  }

  @Get(':id/preview')
  @TemplateGuard(AbilityAction.MANAGE)
  async preview(@Param('id') id: string) {
    return this.previewService.preview(id);
  }

  @Patch(':id/finish')
  @TemplateGuard(AbilityAction.MANAGE)
  async finish(@Param('id') id: string) {
    return this.templatesService.finish(id);
  }

  @Patch(':id')
  @TemplateGuard(AbilityAction.MANAGE)
  @TemplateFilesInterceptor()
  @ApiBody({ type: templateSchema })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() body: CreateTemplateDto,
    @TemplateFiles() files: TemplateFiles,
  ) {
    return this.templatesService.update(
      id,
      body,
      files.frontBackground,
      files.backBackground,
    );
  }

  @Delete(':id')
  @TemplateGuard(AbilityAction.MANAGE)
  async delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }

  @Get(':structureType/:structureId')
  @ApiStructureTypeIdParam()
  @TemplateGuard(AbilityAction.READ)
  async findOneByStructure(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.templatesService.findOneByStructure(structureType, structureId);
  }
}
