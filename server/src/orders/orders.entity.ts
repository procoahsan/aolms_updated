import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Profile } from '../profiles/profiles.entity';
import { Project } from '../projects/projects.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project)
  project_id: string;

  @Column()
  work_date: Date;

  @Column()
  team: string;

  @Column()
  exchange: string;

  @Column()
  order_number: string;

  @Column()
  contact: string;

  @Column()
  lo: string;

  @Column()
  service_identifier: string;

  @Column()
  order_type: string;

  @Column()
  block: string;

  @Column()
  road: string;

  @Column()
  building: string;

  @Column()
  flat: string;

  @Column()
  slot: string;

  @Column()
  package: string;

  @Column()
  cpr_cr: string;

  @Column()
  controller_remarks: string;

  @Column()
  appointment: string;

  @Column()
  task_created_at: Date;

  @Column()
  order_created_at: Date;

  @Column()
  connection_type: string;

  @Column()
  fttr_type: string;

  @Column()
  action: string;

  @Column()
  sub_root_cause: string;

  @Column()
  item_category: string;

  @ManyToOne(() => Profile)
  technician_id: string;

  @ManyToOne(() => Profile)
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}