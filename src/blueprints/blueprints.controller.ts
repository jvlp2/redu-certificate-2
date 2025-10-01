import {
  Body,
  Controller,
  UseGuards,
  Post,
  UploadedFiles,
  Param,
  Patch,
} from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiSecurity,
} from '@nestjs/swagger';
import { BlueprintFilesDecorator } from './blueprint-files.decorator';
import { CreateBlueprintDto } from 'src/blueprints/dto/create-blueprint.dto';
import { BlueprintSchema } from 'src/blueprints/dto/blueprint-schema';
import { ManageBlueprintGuard } from './guards/manage.guard';
import { ClientService } from 'src/client/client.service';
import { type BlueprintFiles } from 'src/blueprints/blueprint-files.interface';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

@ApiSecurity('X-Client-Name')
@ApiBearerAuth()
@Controller('blueprints')
export class BlueprintsController {
  constructor(
    private readonly blueprintsService: BlueprintsService,
    private readonly clientService: ClientService,
  ) {}

  @Post()
  @BlueprintFilesDecorator()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: BlueprintSchema })
  @UseGuards(ManageBlueprintGuard)
  async create(
    @UploadedFiles(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.convertToBytes(10, 'mb'),
        fileType: 'text/html',
      }),
    )
    files: BlueprintFiles,
    @Body() body: CreateBlueprintDto,
  ) {
    return this.blueprintsService.create(files, body);
  }

  @Patch(':id/default')
  @UseGuards(ManageBlueprintGuard)
  setDefault(@Param('id') id: string) {
    return this.clientService.setDefaultBlueprint(id);
  }
}
