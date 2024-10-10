import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '../../enums/TaskStatus';

@Entity()
export class Outbox {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public taskId: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.Pending })
  status: TaskStatus;
}
