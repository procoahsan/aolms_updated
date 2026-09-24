import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ unique: true })
  employee_code: string;

  @Column()
  full_name: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: ['admin', 'controller', 'technician'] })
  role: 'admin' | 'controller' | 'technician';

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}