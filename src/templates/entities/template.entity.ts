import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { Certificate } from 'src/certificates/entities/certificate.entity';
import { Logo } from 'src/logos/entities/logo.entity';
import { Signature } from 'src/signatures/entities/signature.entity';
import { Structure } from 'src/structures/entities/structure.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type GradeType = 'exercise' | 'gradeGroup' | 'structure';
export type Requirements = {
  afterDate?: Date;
  progress?: number;
  presence?: number;
  grade?: {
    type: GradeType;
    id?: number;
    value: number;
  };
};

export type S3KeyOptions = {
  kind: S3KeyKind;
  format?: S3KeyFormat;
  preview?: boolean;
};
export type S3KeyKind =
  | 'front'
  | 'back'
  | 'merged'
  | 'frontBackground'
  | 'backBackground';
export type S3KeyFormat = 'html' | 'png' | 'pdf';

@Entity()
export class Template {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Blueprint, (blueprint) => blueprint.templates, {
    nullable: false,
  })
  @JoinColumn({ name: 'blueprintId' })
  blueprint: Blueprint;

  @OneToOne(() => Structure, (structure) => structure.template)
  @JoinColumn({ name: 'structureId' })
  structure: Structure;

  @Column('boolean', { default: false })
  finished: boolean;

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
  requirements: Requirements;

  @Column('jsonb')
  metadata: {
    hasBackPage: boolean;
    hasCustomBackContent: boolean;
    customBackground: {
      front: boolean;
      back: boolean;
    };
  };

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
    onUpdate: 'now()',
  })
  updatedAt: Date;

  get folderKey() {
    return `templates/${this.id}`;
  }

  getS3Key({ kind, format, preview = false }: S3KeyOptions) {
    const _preview = preview ? 'preview/' : '';
    const _format = format ? `.${format}` : '';
    return `${this.folderKey}/${_preview}${kind}${_format}`;
  }
}
