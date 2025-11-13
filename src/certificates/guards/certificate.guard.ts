import { UseGuards } from '@nestjs/common';
import { CreateCertificateGuard } from 'src/certificates/guards/create.guard';
import { ManageCertificateGuard } from 'src/certificates/guards/manage.guard';
import { AbilityAction } from 'src/redu-api/authorization.service';
import { ReadTemplateGuard } from 'src/templates/guards/read.guard';

export const CertificateGuard = (action: AbilityAction) => {
  switch (action) {
    case AbilityAction.READ:
      return UseGuards(ReadTemplateGuard);
    case AbilityAction.CREATE:
      return UseGuards(CreateCertificateGuard);
    case AbilityAction.MANAGE:
      return UseGuards(ManageCertificateGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
