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
} from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CustomFileFieldsInterceptor } from 'src/interceptors/custom-file-fields.interceptor';
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
  @UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'backgroundImage', maxCount: 1 },
      { name: 'signatureImages', maxCount: 3 },
      { name: 'logoImages', maxCount: 3 },
    ]),
  )
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
    files: Express.Multer.File[],
  ) {
    return this.templatesService.create(body, files);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: UPDATE_SCHEMA,
  })
  @UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'backgroundImage', maxCount: 1 },
      { name: 'signatureImages', maxCount: 3 },
      { name: 'logoImages', maxCount: 3 },
    ]),
  )
  update(
    @Param('id') id: string,
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
    files: Express.Multer.File[],
  ) {
    return this.templatesService.update(id, body, files);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.templatesService.get(id);
  }
}
