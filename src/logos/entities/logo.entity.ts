import { Template } from 'src/templates/entities/template.entity';
import { Column, Entity, JoinColumn } from 'typeorm';
import { ManyToOne } from 'typeorm';
import { PrimaryColumn } from 'typeorm';

@Entity()
export class Logo {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Template, (template) => template.logos)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column('uuid')
  templateId: string;

  getSpacesKey() {
    return `templates/${this.templateId}/logos/${this.id}`;
  }
}
