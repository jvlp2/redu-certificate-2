import {
  Body,
  Controller,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import type { BlueprintFiles } from 'src/blueprints/blueprint-files.interface';
import { CustomFileFieldsInterceptor } from '../interceptors/custom-file-fields.interceptor';
import { CreateBlueprintDto } from 'src/blueprints/dto/create-blueprint.dto';
import { MaxFileSizeValidator } from 'src/validators/max-file-size.validator';
import { FileTypeValidator } from 'src/validators/file-type.validator';

@Controller('blueprints')
export class BlueprintsController {
  constructor(private readonly blueprintsService: BlueprintsService) {}

  @Post()
  @UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'backSmall', maxCount: 1 },
      { name: 'backLarge', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        front: { type: 'string', format: 'binary' },
        backSmall: { type: 'string', format: 'binary' },
        backLarge: { type: 'string', format: 'binary' },
      },
      required: ['name', 'front', 'backSmall', 'backLarge'],
    },
  })
  async create(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000 }),
          new FileTypeValidator({
            fileType: 'text/html',
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    files: BlueprintFiles,
    @Body() body: CreateBlueprintDto,
  ) {
    return this.blueprintsService.create(files, body);
  }
}
