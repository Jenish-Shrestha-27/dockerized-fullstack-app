import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}