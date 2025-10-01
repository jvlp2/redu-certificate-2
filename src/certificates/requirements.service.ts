import { Injectable } from '@nestjs/common';
import { StructuresService } from 'src/structures/structures.service';
import { Template } from 'src/templates/entities/template.entity';

@Injectable()
export class RequirementsService {
  constructor(private readonly structureService: StructuresService) {}

  async canGenerate({ requirements, structure }: Template) {
    const { afterDate, progress, presence, grade } = requirements || {};
    if (!this.checkAfterDate(afterDate)) return false;

    const completion = await this.structureService.getCompletion(
      structure,
      grade?.type,
      grade?.id,
    );

    if (!this.checkGreaterThan(progress, completion.progress)) return false;
    if (!this.checkGreaterThan(grade?.value, completion.grade)) return false;
    return this.checkGreaterThan(presence, completion.presence);
  }

  private checkAfterDate(required: Date | undefined) {
    if (!required) return true;
    if (typeof required === 'string') required = new Date(required);
    return new Date() >= required;
  }

  private checkGreaterThan(required: number | undefined, actual: number) {
    if (!required) return true;
    return actual >= required;
  }
}
