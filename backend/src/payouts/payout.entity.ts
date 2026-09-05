import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/user/user.entity';
import { Beneficiary } from './beneficiary.entity';

export type PayoutStatus =
  | 'INITIATED'
  | 'COMPLIANCE_CHECK'
  | 'PROCESSING'
  | 'SENT_TO_PARTNER'
  | 'COMPLETED'
  | 'FAILED';

export type PayoutPurpose =
  | 'CONTRACTOR_PAYMENT'
  | 'SUPPLIER_INVOICE'
  | 'SERVICES'
  | 'SALARY';

export interface StatusEvent {
  status: PayoutStatus;
  at: string;
  note: string;
}

// Postgres numeric возвращается драйвером как строка — приводим к number
const decimal = {
  type: 'numeric' as const,
  precision: 18,
  scale: 6,
  transformer: {
    to: (v: number | null) => v,
    from: (v: string | null) => (v === null ? null : parseFloat(v)),
  },
};

@Entity()
export class Payout {
  @PrimaryGeneratedColumn()
  id: number;

  // Человекочитаемый номер платежа, показывается клиенту: STR-8F3K2M
  @Column({ unique: true })
  reference: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Beneficiary, { nullable: false, eager: true })
  beneficiary: Beneficiary;

  @Column({ length: 3 })
  sourceCurrency: string;

  @Column(decimal)
  sourceAmount: number;

  @Column({ length: 3 })
  targetCurrency: string;

  @Column(decimal)
  targetAmount: number;

  // Средний рыночный курс на момент котировки
  @Column(decimal)
  midRate: number;

  // Курс, который получил клиент (с нашей наценкой)
  @Column(decimal)
  quotedRate: number;

  // Наценка к курсу в процентах — наш FX-спред
  @Column(decimal)
  markupPercent: number;

  // Фиксированная комиссия в валюте отправки
  @Column(decimal)
  fixedFee: number;

  // Сколько всего списывается с плательщика
  @Column(decimal)
  totalDebit: number;

  @Column({ default: 'CONTRACTOR_PAYMENT' })
  purpose: PayoutPurpose;

  // Номер инвойса или договора — то, что спросит банк при проверке
  @Column({ type: 'varchar', nullable: true })
  invoiceReference: string | null;

  @Column({ default: 'INITIATED' })
  status: PayoutStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  statusHistory: StatusEvent[];

  // Расчётное время зачисления, проставляется при создании
  @Column({ type: 'timestamptz', nullable: true })
  estimatedDelivery: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
