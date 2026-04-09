import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Role } from '../roles/role.enum';
import { Wallet } from '../../wallet/wallet.entity';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 1000 })
  balance: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: false })
  isBlocked: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

}
