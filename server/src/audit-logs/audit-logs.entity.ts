import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  table_name: string;

  @Column()
  record_id: string;

  @Column({ type: 'enum', enum: ['insert', 'update', 'delete'] })
  action: 'insert' | 'update' | 'delete';

  @Column('jsonb', { nullable: true })
  old_values: Record<string, any>;

  @Column('jsonb', { nullable: true })
  new_values: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}