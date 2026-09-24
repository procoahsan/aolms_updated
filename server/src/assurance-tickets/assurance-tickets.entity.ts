import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Project } from '../projects/projects.entity';
import { Profile } from '../profiles/profiles.entity';

@Entity({ name: 'assurance_tickets' })
export class AssuranceTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  project_id: string;

  @Column({ unique: true })
  ticket_number: string;

  @Column()
  work_date: Date;

  @Column()
  team: string;

  @ManyToOne(() => Profile)
  controller_id: string;

  @Column()
  package: string;

  @Column()
  assurance_program: string;

  @Column()
  exchange: string;

  @Column()
  block: string;

  @Column()
  road: string;

  @Column()
  building: string;

  @Column()
  flat: string;

  @Column()
  fault_description_from_lo: string;

  @Column()
  mobile: string;

  @Column()
  customer_description: string;

  @Column()
  service_type: string;

  @Column()
  lo_name: string;

  @Column()
  creation_datetime: Date;

  @Column({ nullable: true })
  assigned_datetime: Date;

  @Column({ nullable: true })
  close_datetime: Date;

  @Column()
  sla_from_creation: number;

  @Column()
  kpi_status: string;

  @Column({ nullable: true })
  reason_if_exceeded: string;

  @Column()
  circuit: string;

  @Column()
  status: string; // e.g., open, in_progress, resolved, closed

  @ManyToOne(() => Profile)
  technician_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}