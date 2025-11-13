import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { StructureType } from 'src/structures/entities/structure.entity';
import { CertificateGuard } from 'src/certificates/guards/certificate.guard';
import { AbilityAction } from 'src/redu-api/authorization.service';
import { ApiSecurity, ApiStructureTypeIdParam } from 'src/decorators/swagger';

@Controller('certificates')
@ApiSecurity()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('')
  findAll() {
    return this.certificatesService.findAll();
  }

  @Post(':structureType/:structureId')
  @CertificateGuard(AbilityAction.CREATE)
  @ApiStructureTypeIdParam()
  async create(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.certificatesService.create(structureType, structureId);
  }

  @Get(':structureType/:structureId')
  @CertificateGuard(AbilityAction.READ)
  @ApiStructureTypeIdParam()
  async findOneByStructure(
    @Param('structureType') structureType: StructureType,
    @Param('structureId') structureId: number,
  ) {
    return this.certificatesService.getCertificateInfo(
      structureType,
      structureId,
    );
  }

  @Get('validate/:validationCode')
  findOneByValidationCode(@Param('validationCode') validationCode: string) {
    return this.certificatesService.getValidationInfo(validationCode);
  }

  @Delete(':id')
  @CertificateGuard(AbilityAction.MANAGE)
  remove(@Param('id') id: string) {
    return this.certificatesService.remove(id);
  }
}
