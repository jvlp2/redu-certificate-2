import { Template } from 'src/templates/entities/template.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Blueprint {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('varchar')
  name: string;

  @OneToMany(() => Template, (template) => template.blueprint)
  templates: Template[];
}
