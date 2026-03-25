import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth/user/user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  fromUser: User | null;

  @ManyToOne(() => User, { nullable: true })
  toUser: User | null;

  @Column()
  amount: number;

  @Column()
  createdAt: Date;
}