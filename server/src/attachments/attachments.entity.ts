import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Profile } from '../profiles/profiles.entity';

@Entity({ name: 'attachments' })
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  submission_id: string;

  @Column({ type: 'enum', enum: ['delivery_submission', 'assurance_submission'] })
  submission_type: 'delivery_submission' | 'assurance_submission';

  @Column()
  file_name: string;

  @Column()
  storage_path: string;

  @Column()
  file_type: string;

  @Column()
  file_size: number;

  @ManyToOne(() => Profile, (profile) => profile.id)
  uploaded_by: string;

  @CreateDateColumn()
  created_at: Date;
}