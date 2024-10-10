import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatusEnum } from '../../enums/task-status.enum';

@Entity()
export class Outbox {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public taskId: string;

  @Column({
    type: 'enum',
    enum: TaskStatusEnum,
    default: TaskStatusEnum.Pending,
  })
  status: TaskStatusEnum;
}
