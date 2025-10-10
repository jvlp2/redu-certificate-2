import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
} from '@nestjs/common';
import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('logos')
export class LogosController {
  constructor(private readonly logosService: LogosService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        templateId: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['templateId'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createLogoDto: CreateLogoDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({
            fileType: 'image/*',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.logosService.create(createLogoDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logosService.remove(id);
  }
}
