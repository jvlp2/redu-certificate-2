import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

const SCHEMA = {
  type: 'object',
  properties: {
    templateId: { type: 'string' },
    file: { type: 'string', format: 'binary' },
    name: { type: 'string' },
    role: { type: 'string' },
  },
  required: ['templateId', 'name', 'role'],
};

@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: SCHEMA })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateSignatureDto,
    @UploadedFile(
      FileValidationFactory.createImageValidationPipe({ required: true }),
    )
    file: Express.Multer.File,
  ) {
    return this.signaturesService.create(body, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signaturesService.remove(id);
  }
}
