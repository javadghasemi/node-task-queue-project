import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: string;

  @Column()
  status: string;

  @Column()
  type: string;

  @Column()
  data: string;

  @Column({ default: false })
  submitted: boolean;
}
