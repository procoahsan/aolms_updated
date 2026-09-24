import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity({ name: 'cpe_inventory' })
export class CpeInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.id)
  project_id: string;

  @Column()
  order_number: string;

  @Column()
  installation_date: Date;

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
  asset_description: string;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  po_number: string;

  @Column({ unique: true })
  serial_number: string;

  @Column()
  contractor: string;

  @Column()
  connection_type: string;

  @Column()
  lo_name: string;

  @Column()
  labor_charge: number;

  @Column()
  cpe_charge: number;

  @Column()
  source_year: number;

  @Column()
  source_sheet: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}