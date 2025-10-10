import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseInterceptors,
  Delete,
  Get,
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiSecurity } from '@nestjs/swagger';
import {
  AccessControlService,
  Model,
} from 'src/redu-api/access-control.service';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { templateSchema } from 'src/templates/dto/template-schema';
import { Template } from 'src/templates/entities/template.entity';
import { TemplatesService } from 'src/templates/templates.service';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

@ApiSecurity('X-Client-Name')
@ApiSecurity('Authorization')
@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: templateSchema })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  async create(
    @Body() body: CreateTemplateDto,
    @UploadedFile(FileValidationFactory.createImageValidationPipe())
    file: Express.Multer.File,
  ) {
    await this.authorize(body);
    return this.templatesService.create(body, file);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: templateSchema })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  async update(
    @Param('id') id: string,
    @Body() body: CreateTemplateDto,
    @UploadedFile(FileValidationFactory.createImageValidationPipe())
    file: Express.Multer.File,
  ) {
    await this.authorize({ id });
    return this.templatesService.update(id, body, file);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.authorize({ id });
    return this.templatesService.delete(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.authorize({ id });
    return this.templatesService.findOne(id);
  }

  @Get(':structureType/:structureId')
  @ApiParam({
    name: 'structureType',
    type: 'string',
    enum: ['environment', 'course', 'space'],
  })
  async findOneByStructure(
    @Param('structureType') structureType: string,
    @Param('structureId') structureId: number,
  ) {
    await this.authorize({ structureType, structureId });
    const template = await this.templatesService.findOneByStructure(
      structureType,
      structureId,
    );
    return template;
  }

  private async authorize(options: {
    id?: string;
    template?: Template;
    structureType?: string;
    structureId?: number;
  }) {
    if (options.id || options.template) {
      const template =
        options.template ?? (await this.templatesService.findOne(options.id!));

      return this.accessControlService.authorize({
        abilityAction: 'manage',
        model: template.structureType as Model,
        id: template.structureId.toString(),
      });
    }

    if (options.structureType && options.structureId) {
      return this.accessControlService.authorize({
        abilityAction: 'manage',
        model: options.structureType as Model,
        id: options.structureId.toString(),
      });
    }

    throw new InternalServerErrorException('Invalid authorize options');
  }
}
