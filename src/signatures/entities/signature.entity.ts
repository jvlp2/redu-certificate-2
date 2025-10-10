import { Template } from 'src/templates/entities/template.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Signature {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Template, (template) => template.signatures)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column('varchar')
  name: string;

  @Column('varchar')
  role: string;

  getSpacesKey() {
    return `templates/${this.template.id}/signatures/${this.id}`;
  }
}
