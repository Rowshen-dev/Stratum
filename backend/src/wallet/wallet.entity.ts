import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/user/user.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: false })
isFrozen: boolean;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}