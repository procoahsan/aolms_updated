import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { AssuranceTicket } from '../assurance-tickets/assurance-tickets.entity';
import { Profile } from '../profiles/profiles.entity';

export enum AssuranceSubmissionStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Locked = 'locked',
}

@Entity({ name: 'assurance_submissions' })
export class AssuranceSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssuranceTicket)
  ticket_id: string;

  @ManyToOne(() => Profile)
  technician_id: string;

  @Column({ type: 'enum', enum: AssuranceSubmissionStatus, default: AssuranceSubmissionStatus.Draft })
  status: AssuranceSubmissionStatus;

  @Column()
  last_saved_at: Date;

  @Column({ nullable: true })
  submitted_at: Date;

  @Column({ nullable: true })
  edit_deadline: Date;

  @Column({ nullable: true })
  root_cause: string;

  @Column({ nullable: true })
  resolution: string;

  @Column({ nullable: true })
  resolution_description: string;

  @Column({ nullable: true })
  mims: string;

  @Column({ nullable: true })
  replacement_reason: string;

  @Column({ nullable: true })
  replaced_cpe_model: string;

  @Column({ nullable: true })
  replaced_cpe_sn: string;

  @Column({ nullable: true })
  new_cpe_model: string;

  @Column({ nullable: true })
  new_cpe_sn: string;

  @Column({ nullable: true })
  ont_protection_box: string;

  @Column({ nullable: true })
  saas_type: string;

  @Column({ nullable: true })
  box_number: string;

  @Column({ nullable: true })
  replacement: string;

  @Column({ nullable: true })
  saas_non_saas: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  physical_verification: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  closed: boolean;

  @Column({ nullable: true })
  remarks: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}