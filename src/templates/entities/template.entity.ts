import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Template {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Blueprint, (blueprint) => blueprint.templates)
  @JoinColumn({ name: 'blueprintId' })
  blueprint: Blueprint;
}
