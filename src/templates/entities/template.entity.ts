import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Template {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Blueprint, (blueprint) => blueprint.templates)
  @JoinColumn({ name: 'blueprintId' })
  blueprint: Blueprint;

  @Column('jsonb')
  frontData: {
    title: string;
    organization: string;
    workload: number;
    startDate: Date;
    endDate: Date;
    info: string;
    signaturesData: { name: string; role: string }[];
  };

  @Column('jsonb')
  backData: {
    title: string;
    subtitle: string;
    footer: string;
    content: string;
  };

  @Column('jsonb')
  metadata: {
    numberOfPages: number;
    numberOfSignatures: number;
    numberOfLogos: number;
    back: {
      hasTitle: boolean;
      hasSubtitle: boolean;
      hasFooter: boolean;
    };
  };
}
