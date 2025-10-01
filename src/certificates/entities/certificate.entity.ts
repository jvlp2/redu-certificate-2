import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

export class Certificate {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Blueprint, (blueprint) => blueprint.templates)
  @JoinColumn({ name: 'blueprintId' })
  blueprint: Blueprint;
}
