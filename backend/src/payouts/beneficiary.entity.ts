import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../auth/user/user.entity';

export type BeneficiaryType = 'INDIVIDUAL' | 'BUSINESS';
export type DeliveryMethod = 'CARD' | 'BANK';

@Entity()
export class Beneficiary {
  @PrimaryGeneratedColumn()
  id: number;

  // Владелец записи — компания-плательщик, которая завела получателя
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column({ default: 'INDIVIDUAL' })
  type: BeneficiaryType;

  // ISO-код страны получателя: UZ, KZ
  @Column({ length: 2 })
  country: string;

  // Валюта зачисления: UZS, KZT, USD
  @Column({ length: 3 })
  currency: string;

  @Column({ default: 'CARD' })
  deliveryMethod: DeliveryMethod;

  // Для CARD — последние 4 цифры карты (полный номер не храним)
  @Column({ type: 'varchar', length: 4, nullable: true })
  cardLast4: string | null;

  // Для BANK — реквизиты
  @Column({ type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ type: 'varchar', nullable: true })
  accountNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  swiftCode: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
