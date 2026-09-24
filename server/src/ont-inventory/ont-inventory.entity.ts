import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'ont_inventory' })
export class OntInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  item_code: string;

  @Column()
  receiving_date: Date;

  @Column({ nullable: true })
  reservation_number: string;

  @Column({ unique: true })
  serial_number: string;

  @Column()
  quantity: number;

  @Column()
  model: string;

  @Column({ nullable: true })
  po_number: string;

  @Column()
  ont_type: string;

  @Column()
  source_sheet: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}