import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { AssuranceSubmission } from '../assurance-submissions/assurance-submissions.entity';
import { DeliverySubmission } from '../delivery-submissions/delivery-submissions.entity';

@Entity({ name: 'cpe_replacements' })
export class CpeReplacement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  submission_id: string;

  @Column({ type: 'enum', enum: ['delivery_submission', 'assurance_submission'] })
  submission_type: 'delivery_submission' | 'assurance_submission';

  @Column()
  old_cpe_model: string;

  @Column()
  old_cpe_serial: string;

  @Column()
  new_cpe_model: string;

  @Column()
  new_cpe_serial: string;

  @Column()
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}