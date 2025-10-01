import { Certificate } from 'src/certificates/entities/certificate.entity';
import { Client } from 'src/client/entities/client.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Client, (client) => client.users)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];

  @Column('integer')
  reduUserId: number;

  @Column('varchar')
  name: string;
}
