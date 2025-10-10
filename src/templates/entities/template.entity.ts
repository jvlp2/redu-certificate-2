import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { Certificate } from 'src/certificates/entities/certificate.entity';
import { Logo } from 'src/logos/entities/logo.entity';
import { Signature } from 'src/signatures/entities/signature.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Template {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Blueprint, (blueprint) => blueprint.templates)
  @JoinColumn({ name: 'blueprintId' })
  blueprint: Blueprint;

  @OneToMany(() => Certificate, (certificate) => certificate.template)
  certificates: Certificate[];

  @OneToMany(() => Signature, (signature) => signature.template, {
    onDelete: 'CASCADE',
  })
  signatures: Signature[];

  @OneToMany(() => Logo, (logo) => logo.template, {
    onDelete: 'CASCADE',
  })
  logos: Logo[];

  @Column('jsonb')
  frontData: {
    title: string;
    organization: string;
    workload: number;
    startDate: Date;
    endDate: Date;
    info: string;
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
    back: {
      hasTitle: boolean;
      hasSubtitle: boolean;
      hasFooter: boolean;
    };
  };

  getSpacesKey() {
    return `templates/${this.id}`;
  }

  getBackgroundImageSpacesKey() {
    return `templates/${this.id}/backgroundImage`;
  }
}
