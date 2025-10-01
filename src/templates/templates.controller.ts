import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseInterceptors,
  Delete,
  Get,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { templateSchema } from 'src/templates/dto/template-schema';
import { TemplatesService } from 'src/templates/templates.service';
import { FileValidationFactory } from 'src/validators/file-validation.factory';
import { FileFieldsInterceptor } from '../interceptors/file-fields.interceptor';
import { ManageTemplateGuard } from 'src/templates/guards/manage.guard';
import { ReadTemplateGuard } from 'src/templates/guards/read.guard';
import { PreviewService } from 'src/templates/preview.service';
import { StructureType } from 'src/structures/entities/structure.entity';

type backgroundFiles = {
  frontBackground: Express.Multer.File;
  backBackground: Express.Multer.File;
};

@ApiSecurity('X-Client-Name')
@ApiBearerAuth()
@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly previewService: PreviewService,
  ) {}

  @Post(':structureType/:structureId')
  @ApiParam({
    name: 'structureType',
    type: 'string',
    enum: ['environment', 'course', 'space'],
  })
  @ApiParam({ name: 'structureId', type: 'number' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: templateSchema })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'frontBackground', maxCount: 1 },
      { name: 'backBackground', maxCount: 1 },
    ]),
  )
  @UseGuards(ManageTemplateGuard)
  async create(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
    @Body() body: CreateTemplateDto,
    @UploadedFiles(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.convertToBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    files: backgroundFiles,
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
  @UseGuards(ManageTemplateGuard)
  async preview(@Param('id') id: string) {
    return this.previewService.preview(id);
  }

  @Patch(':id/finish')
  @UseGuards(ManageTemplateGuard)
  async finish(@Param('id') id: string) {
    return this.templatesService.finish(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: templateSchema })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'frontBackground', maxCount: 1 },
      { name: 'backBackground', maxCount: 1 },
    ]),
  )
  @UseGuards(ManageTemplateGuard)
  async update(
    @Param('id') id: string,
    @Body() body: CreateTemplateDto,
    @UploadedFiles(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.convertToBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    files: backgroundFiles,
  ) {
    return this.templatesService.update(
      id,
      body,
      files.frontBackground,
      files.backBackground,
    );
  }

  @Delete(':id')
  @UseGuards(ManageTemplateGuard)
  async delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }

  @Get(':structureType/:structureId')
  @ApiParam({
    name: 'structureType',
    type: 'string',
    enum: ['environment', 'course', 'space'],
  })
  @ApiParam({ name: 'structureId', type: 'number' })
  @UseGuards(ReadTemplateGuard)
  async findOneByStructure(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.templatesService.findOneByStructure(structureType, structureId);
  }
}
