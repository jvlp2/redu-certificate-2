import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { ApiBearerAuth, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { CreateCertificateGuard } from './guards/create.guard';
import { ManageCertificateGuard } from './guards/manage.guard';
import { StructureType } from 'src/structures/entities/structure.entity';

@Controller('certificates')
@ApiSecurity('X-Client-Name')
@ApiBearerAuth()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post(':structureType/:structureId')
  @UseGuards(CreateCertificateGuard)
  @ApiParam({
    name: 'structureType',
    type: 'string',
    enum: ['environment', 'course', 'space'],
  })
  @ApiParam({ name: 'structureId', type: 'number' })
  async create(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.certificatesService.create(structureType, structureId);
  }

  @Get('')
  findAll() {
    return this.certificatesService.findAll();
  }

  @Get('validate/:validationCode')
  findOneByValidationCode(@Param('validationCode') validationCode: string) {
    return this.certificatesService.findOneBy({
      where: { validationCode },
    });
  }

  @Get(':structureType/:structureId')
  @ApiParam({
    name: 'structureType',
    type: 'string',
    enum: ['environment', 'course', 'space'],
  })
  @ApiParam({ name: 'structureId', type: 'number' })
  async findOneByStructure(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.certificatesService.getCertificateInfo(
      structureType,
      structureId,
    );
  }

  @Delete(':id')
  @UseGuards(ManageCertificateGuard)
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }
}
