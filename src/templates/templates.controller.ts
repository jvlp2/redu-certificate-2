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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AccessControlService } from 'src/access-control/access-control.service';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { TemplatesService } from 'src/templates/templates.service';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

const SCHEMA = {
  type: 'object',
  properties: {
    blueprintId: { type: 'string', format: 'uuid' },
    backgroundImage: { type: 'string', format: 'binary' },
    frontData: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        organization: { type: 'string' },
        workload: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        info: { type: 'string' },
      },
    },
    backData: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        footer: { type: 'string' },
        content: { type: 'string' },
      },
    },
  },
  required: ['blueprintId', 'frontData', 'backData'],
};

@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: SCHEMA })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  async create(
    @Body() body: CreateTemplateDto,
    @UploadedFile(FileValidationFactory.createImageValidationPipe())
    file: Express.Multer.File,
  ) {
    await this.accessControlService.authorize({
      abilityAction: 'manage',
      model: body.structureType,
      id: body.structureId.toString(),
    });
    return this.templatesService.create(body, file);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: SCHEMA })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  update(
    @Param('id') id: string,
    @Body() body: CreateTemplateDto,
    @UploadedFile(FileValidationFactory.createImageValidationPipe())
    file: Express.Multer.File,
  ) {
    return this.templatesService.update(id, body, file);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }
}
