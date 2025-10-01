import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Base64FileInterceptor } from 'src/interceptors/base64-file.interceptor';
import { CreateTemplateDto } from 'src/templates/dto/create-template.dto';
import { TemplatesService } from 'src/templates/templates.service';
import { MaxFileSizeValidator } from 'src/validators/max-file-size.validator';
import { FileTypeValidator } from 'src/validators/file-type.validator';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiBody({ type: CreateTemplateDto })
  @UseInterceptors(Base64FileInterceptor(CreateTemplateDto))
  create(
    @Body() body: CreateTemplateDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    files: { signatures: Express.Multer.File[] },
  ) {
    console.log('files', files);
    console.log('body', body);
    return 'mock';
    return this.templatesService.create(body);
  }
}
