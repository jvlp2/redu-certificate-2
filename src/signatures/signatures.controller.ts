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
import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        templateId: { type: 'string' },
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        role: { type: 'string' },
      },
      required: ['templateId', 'name', 'role'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createSignatureDto: CreateSignatureDto,
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
    return this.signaturesService.create(createSignatureDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signaturesService.remove(id);
  }
}
