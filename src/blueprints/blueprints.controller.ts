import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { ApiBody, ApiConsumes, ApiSecurity } from '@nestjs/swagger';
import type { BlueprintFiles } from 'src/blueprints/blueprint-files.interface';
import { FileFieldsInterceptor } from '../interceptors/custom-file-fields.interceptor';
import { CreateBlueprintDto } from 'src/blueprints/dto/create-blueprint.dto';
import { FileValidationFactory } from 'src/validators/file-validation.factory';
import { AccessControlService } from 'src/redu-api/access-control.service';

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    front: { type: 'string', format: 'binary' },
    backSmall: { type: 'string', format: 'binary' },
    backLarge: { type: 'string', format: 'binary' },
  },
  required: ['name', 'front', 'backSmall', 'backLarge'],
};

@ApiSecurity('X-Client-Name')
@ApiSecurity('Authorization')
@Controller('blueprints')
export class BlueprintsController {
  constructor(
    private readonly blueprintsService: BlueprintsService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'backSmall', maxCount: 1 },
      { name: 'backLarge', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: SCHEMA })
  async create(
    @UploadedFiles(FileValidationFactory.createHtmlValidationPipe())
    files: BlueprintFiles,
    @Body() body: CreateBlueprintDto,
  ) {
    await this.accessControlService.authorize({
      abilityAction: 'create',
      model: 'blueprint',
    });
    return this.blueprintsService.create(files, body);
  }
}
