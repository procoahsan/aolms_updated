import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Order } from '../orders/orders.entity';
import { Profile } from '../profiles/profiles.entity';

export enum AssignmentStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

@Entity({ name: 'order_assignments' })
export class OrderAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order)
  order_id: string;

  @ManyToOne(() => Profile)
  technician_id: string;

  @ManyToOne(() => Profile)
  assigned_by: string;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.Pending })
  assignment_status: AssignmentStatus;

  @Column()
  assigned_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}