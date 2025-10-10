import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  Delete,
  Get,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { CREATE_SCHEMA } from 'src/templates/swagger-schemas/create';
import { UPDATE_SCHEMA } from 'src/templates/swagger-schemas/update';
import { TemplatesService } from 'src/templates/templates.service';
import { FileTypeValidator } from 'src/validators/file-type.validator';
import { MaxFileSizeValidator } from 'src/validators/max-file-size.validator';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: CREATE_SCHEMA,
  })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  create(
    @Body() body: CreateTemplateDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({
            fileType: 'image/*',
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.templatesService.create(body, file);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: UPDATE_SCHEMA,
  })
  @UseInterceptors(FileInterceptor('backgroundImage'))
  update(
    @Param('id') id: string,
    @Body() body: CreateTemplateDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({
            fileType: 'image/*',
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
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
