import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../auth/user/user.entity';
 import { CreateDateColumn } from 'typeorm';

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

@CreateDateColumn()
createdAt: Date;
}