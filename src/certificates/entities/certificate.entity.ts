import { Template } from 'src/templates/entities/template.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Certificate {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Template, (template) => template.certificates)
  @JoinColumn({ name: 'templateId' })
  template: Template;
}
