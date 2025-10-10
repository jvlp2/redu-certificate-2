import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

const SCHEMA = {
  type: 'object',
  properties: {
    templateId: { type: 'string' },
    file: { type: 'string', format: 'binary' },
  },
  required: ['templateId'],
};
@Controller('logos')
export class LogosController {
  constructor(private readonly logosService: LogosService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: SCHEMA })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateLogoDto,
    @UploadedFile(
      FileValidationFactory.createImageValidationPipe({ required: true }),
    )
    file: Express.Multer.File,
  ) {
    return this.logosService.create(body, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logosService.remove(id);
  }
}
