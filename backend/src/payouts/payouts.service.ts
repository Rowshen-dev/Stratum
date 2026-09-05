import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { FxService } from './fx.service';
import { Beneficiary, DeliveryMethod } from './beneficiary.entity';
import { Payout, PayoutPurpose, PayoutStatus, StatusEvent } from './payout.entity';
import { User } from '../auth/user/user.entity';
import { Wallet } from '../wallet/wallet.entity';

/**
 * Коридоры, которые мы обслуживаем.
 * Каждый описывает, откуда приходят деньги, куда уходят
 * и по какому каналу доставляются.
 */
export interface CorridorConfig {
  sourceCurrencies: string[];
  targetCurrency: string;
  country: string;
  countryName: string;
  methods: {
    method: DeliveryMethod;
    label: string;
    rail: string;
    fixedFee: number;
    hoursToDeliver: number;
    maxAmountUsd: number;
  }[];
}

export const CORRIDORS: Record<string, CorridorConfig> = {
  UZ: {
    sourceCurrencies: ['USD', 'EUR', 'GBP'],
    targetCurrency: 'UZS',
    country: 'UZ',
    countryName: 'Uzbekistan',
    methods: [
      {
        method: 'CARD',
        label: 'Card in local currency',
        rail: 'Visa Direct',
        fixedFee: 2,
        hoursToDeliver: 48,
        maxAmountUsd: 50000,
      },
      {
        method: 'BANK',
        label: 'Bank account in USD',
        rail: 'SWIFT',
        fixedFee: 12,
        hoursToDeliver: 24,
        maxAmountUsd: 1000000,
      },
    ],
  },
  KZ: {
    sourceCurrencies: ['USD', 'EUR', 'GBP'],
    targetCurrency: 'KZT',
    country: 'KZ',
    countryName: 'Kazakhstan',
    methods: [
      {
        method: 'CARD',
        label: 'Card in local currency',
        rail: 'Visa Direct',
        fixedFee: 2,
        hoursToDeliver: 48,
        maxAmountUsd: 50000,
      },
      {
        method: 'BANK',
        label: 'Bank account in USD',
        rail: 'SWIFT',
        fixedFee: 12,
        hoursToDeliver: 24,
        maxAmountUsd: 1000000,
      },
    ],
  },
};

// Наш FX-спред: наценка к среднему рыночному курсу
const MARKUP_PERCENT = 0.75;

const STATUS_FLOW: { status: PayoutStatus; note: string; afterMinutes: number }[] = [
  { status: 'INITIATED', note: 'Payment created', afterMinutes: 0 },
  { status: 'COMPLIANCE_CHECK', note: 'Beneficiary and purpose screened', afterMinutes: 1 },
  { status: 'PROCESSING', note: 'Funds converted at quoted rate', afterMinutes: 3 },
  { status: 'SENT_TO_PARTNER', note: 'Sent to payout partner', afterMinutes: 8 },
  { status: 'COMPLETED', note: 'Credited to beneficiary', afterMinutes: 20 },
];

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(Payout) private payouts: Repository<Payout>,
    @InjectRepository(Beneficiary) private beneficiaries: Repository<Beneficiary>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Wallet) private wallets: Repository<Wallet>,
    private fx: FxService,
  ) {}

  getCorridors() {
    return Object.values(CORRIDORS);
  }

  private findMethod(country: string, method: DeliveryMethod) {
    const corridor = CORRIDORS[country];
    if (!corridor) {
      throw new BadRequestException(`Коридор для страны ${country} не поддерживается`);
    }
    const config = corridor.methods.find((m) => m.method === method);
    if (!config) {
      throw new BadRequestException(`Способ доставки ${method} недоступен для ${country}`);
    }
    return { corridor, config };
  }

  /**
   * Котировка: сколько получит бенефициар и сколько мы спишем.
   * Ничего не сохраняет — это расчёт для экрана перед подтверждением.
   */
  async quote(params: {
    sourceCurrency: string;
    sourceAmount: number;
    country: string;
    method: DeliveryMethod;
  }) {
    const { sourceCurrency, sourceAmount, country, method } = params;

    if (!sourceAmount || sourceAmount <= 0) {
      throw new BadRequestException('Сумма должна быть больше нуля');
    }

    const { corridor, config } = this.findMethod(country, method);

    if (!corridor.sourceCurrencies.includes(sourceCurrency)) {
      throw new BadRequestException(
        `Валюта ${sourceCurrency} не поддерживается для ${corridor.countryName}`,
      );
    }

    // Лимит канала считаем в долларах
    const { rate: toUsd } = await this.fx.getMidRate(sourceCurrency, 'USD');
    const amountInUsd = sourceAmount * toUsd;
    if (amountInUsd > config.maxAmountUsd) {
      throw new BadRequestException(
        `Лимит для этого канала — ${config.maxAmountUsd.toLocaleString('en-US')} USD на получателя`,
      );
    }

    // CARD доставляет в локальной валюте, BANK — в валюте отправки
    const targetCurrency =
      method === 'CARD' ? corridor.targetCurrency : sourceCurrency;

    const { rate: midRate, stale } = await this.fx.getMidRate(
      sourceCurrency,
      targetCurrency,
    );

    const markupPercent = targetCurrency === sourceCurrency ? 0 : MARKUP_PERCENT;
    const quotedRate = midRate * (1 - markupPercent / 100);
    const targetAmount = sourceAmount * quotedRate;

    const fixedFee = config.fixedFee;
    const fxMargin = sourceAmount * (markupPercent / 100);
    const totalDebit = sourceAmount + fixedFee;

    const estimatedDelivery = new Date(
      Date.now() + config.hoursToDeliver * 60 * 60 * 1000,
    );

    return {
      sourceCurrency,
      sourceAmount: round(sourceAmount, 2),
      targetCurrency,
      targetAmount: round(targetAmount, targetCurrency === 'UZS' ? 0 : 2),
      midRate: round(midRate, 6),
      quotedRate: round(quotedRate, 6),
      markupPercent,
      fixedFee,
      totalDebit: round(totalDebit, 2),
      // Наша выручка по этой сделке — спред плюс фикс
      revenue: round(fxMargin + fixedFee, 2),
      rail: config.rail,
      deliveryMethod: method,
      hoursToDeliver: config.hoursToDeliver,
      estimatedDelivery,
      rateIsStale: stale,
      countryName: corridor.countryName,
    };
  }

  async listBeneficiaries(userId: number) {
    return this.beneficiaries.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async createBeneficiary(
    userId: number,
    body: {
      name: string;
      type?: 'INDIVIDUAL' | 'BUSINESS';
      country: string;
      deliveryMethod: DeliveryMethod;
      cardNumber?: string;
      bankName?: string;
      accountNumber?: string;
      swiftCode?: string;
    },
  ) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const { corridor } = this.findMethod(body.country, body.deliveryMethod);

    if (!body.name?.trim()) {
      throw new BadRequestException('Укажите имя получателя');
    }

    if (body.deliveryMethod === 'CARD') {
      const digits = (body.cardNumber || '').replace(/\D/g, '');
      if (digits.length < 12) {
        throw new BadRequestException('Укажите корректный номер карты');
      }
    } else if (!body.accountNumber?.trim()) {
      throw new BadRequestException('Укажите номер счёта');
    }

    const beneficiary = this.beneficiaries.create({
      user,
      name: body.name.trim(),
      type: body.type || 'INDIVIDUAL',
      country: body.country,
      currency:
        body.deliveryMethod === 'CARD' ? corridor.targetCurrency : 'USD',
      deliveryMethod: body.deliveryMethod,
      // Полный номер карты не сохраняем — только хвост для узнавания
      cardLast4:
        body.deliveryMethod === 'CARD'
          ? (body.cardNumber || '').replace(/\D/g, '').slice(-4)
          : null,
      bankName: body.bankName?.trim() || null,
      accountNumber: body.accountNumber?.trim() || null,
      swiftCode: body.swiftCode?.trim() || null,
    });

    return this.beneficiaries.save(beneficiary);
  }

  async createPayout(
    userId: number,
    body: {
      beneficiaryId: number;
      sourceCurrency: string;
      sourceAmount: number;
      purpose?: PayoutPurpose;
      invoiceReference?: string;
    },
  ) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const beneficiary = await this.beneficiaries.findOne({
      where: { id: body.beneficiaryId, user: { id: userId } },
    });
    if (!beneficiary) throw new NotFoundException('Получатель не найден');

    const quote = await this.quote({
      sourceCurrency: body.sourceCurrency,
      sourceAmount: body.sourceAmount,
      country: beneficiary.country,
      method: beneficiary.deliveryMethod,
    });

    const wallet = await this.wallets.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) throw new NotFoundException('Кошелёк не найден');
    if (wallet.isFrozen) {
      throw new BadRequestException('Кошелёк заморожен, платежи недоступны');
    }
    if (Number(wallet.balance) < quote.totalDebit) {
      throw new BadRequestException(
        `Недостаточно средств. Нужно ${quote.totalDebit} ${quote.sourceCurrency}, доступно ${wallet.balance}`,
      );
    }

    wallet.balance = round(Number(wallet.balance) - quote.totalDebit, 2);
    await this.wallets.save(wallet);

    const now = new Date();
    const firstEvent: StatusEvent = {
      status: 'INITIATED',
      at: now.toISOString(),
      note: 'Payment created',
    };

    const payout = this.payouts.create({
      reference: 'STR-' + randomBytes(3).toString('hex').toUpperCase(),
      user,
      beneficiary,
      sourceCurrency: quote.sourceCurrency,
      sourceAmount: quote.sourceAmount,
      targetCurrency: quote.targetCurrency,
      targetAmount: quote.targetAmount,
      midRate: quote.midRate,
      quotedRate: quote.quotedRate,
      markupPercent: quote.markupPercent,
      fixedFee: quote.fixedFee,
      totalDebit: quote.totalDebit,
      purpose: body.purpose || 'CONTRACTOR_PAYMENT',
      invoiceReference: body.invoiceReference?.trim() || null,
      status: 'INITIATED',
      statusHistory: [firstEvent],
      estimatedDelivery: quote.estimatedDelivery,
    });

    return this.payouts.save(payout);
  }

  /**
   * Продвигает статус по времени, прошедшему с создания.
   * Реальной отправки денег нет — партнёрский рельс ещё не подключён,
   * поэтому прогресс рассчитывается детерминированно.
   */
  private advance(payout: Payout): Payout {
    if (payout.status === 'COMPLETED' || payout.status === 'FAILED') {
      return payout;
    }

    const minutesPassed = (Date.now() - payout.createdAt.getTime()) / 60000;
    const reached = STATUS_FLOW.filter((s) => minutesPassed >= s.afterMinutes);
    if (!reached.length) return payout;

    const target = reached[reached.length - 1];
    if (target.status === payout.status) return payout;

    const known = new Set(payout.statusHistory.map((e) => e.status));
    const added = reached
      .filter((s) => !known.has(s.status))
      .map((s) => ({
        status: s.status,
        at: new Date(
          payout.createdAt.getTime() + s.afterMinutes * 60000,
        ).toISOString(),
        note: s.note,
      }));

    payout.status = target.status;
    payout.statusHistory = [...payout.statusHistory, ...added];
    return payout;
  }

  async getPayout(userId: number, reference: string) {
    const payout = await this.payouts.findOne({
      where: { reference, user: { id: userId } },
    });
    if (!payout) throw new NotFoundException('Платёж не найден');

    const before = payout.status;
    this.advance(payout);
    if (payout.status !== before) await this.payouts.save(payout);

    return payout;
  }

  async listPayouts(userId: number, page = 1, limit = 10) {
    const [rows, total] = await this.payouts.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const updated = rows.map((p) => this.advance(p));
    await this.payouts.save(updated);

    return { total, page, limit, data: updated };
  }
}

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}
