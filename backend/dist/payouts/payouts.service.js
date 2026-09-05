"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsService = exports.CORRIDORS = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const fx_service_1 = require("./fx.service");
const beneficiary_entity_1 = require("./beneficiary.entity");
const payout_entity_1 = require("./payout.entity");
const user_entity_1 = require("../auth/user/user.entity");
const wallet_entity_1 = require("../wallet/wallet.entity");
exports.CORRIDORS = {
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
const MARKUP_PERCENT = 0.75;
const STATUS_FLOW = [
    { status: 'INITIATED', note: 'Payment created', afterMinutes: 0 },
    { status: 'COMPLIANCE_CHECK', note: 'Beneficiary and purpose screened', afterMinutes: 1 },
    { status: 'PROCESSING', note: 'Funds converted at quoted rate', afterMinutes: 3 },
    { status: 'SENT_TO_PARTNER', note: 'Sent to payout partner', afterMinutes: 8 },
    { status: 'COMPLETED', note: 'Credited to beneficiary', afterMinutes: 20 },
];
let PayoutsService = class PayoutsService {
    payouts;
    beneficiaries;
    users;
    wallets;
    fx;
    constructor(payouts, beneficiaries, users, wallets, fx) {
        this.payouts = payouts;
        this.beneficiaries = beneficiaries;
        this.users = users;
        this.wallets = wallets;
        this.fx = fx;
    }
    getCorridors() {
        return Object.values(exports.CORRIDORS);
    }
    findMethod(country, method) {
        const corridor = exports.CORRIDORS[country];
        if (!corridor) {
            throw new common_1.BadRequestException(`Коридор для страны ${country} не поддерживается`);
        }
        const config = corridor.methods.find((m) => m.method === method);
        if (!config) {
            throw new common_1.BadRequestException(`Способ доставки ${method} недоступен для ${country}`);
        }
        return { corridor, config };
    }
    async quote(params) {
        const { sourceCurrency, sourceAmount, country, method } = params;
        if (!sourceAmount || sourceAmount <= 0) {
            throw new common_1.BadRequestException('Сумма должна быть больше нуля');
        }
        const { corridor, config } = this.findMethod(country, method);
        if (!corridor.sourceCurrencies.includes(sourceCurrency)) {
            throw new common_1.BadRequestException(`Валюта ${sourceCurrency} не поддерживается для ${corridor.countryName}`);
        }
        const { rate: toUsd } = await this.fx.getMidRate(sourceCurrency, 'USD');
        const amountInUsd = sourceAmount * toUsd;
        if (amountInUsd > config.maxAmountUsd) {
            throw new common_1.BadRequestException(`Лимит для этого канала — ${config.maxAmountUsd.toLocaleString('en-US')} USD на получателя`);
        }
        const targetCurrency = method === 'CARD' ? corridor.targetCurrency : sourceCurrency;
        const { rate: midRate, stale } = await this.fx.getMidRate(sourceCurrency, targetCurrency);
        const markupPercent = targetCurrency === sourceCurrency ? 0 : MARKUP_PERCENT;
        const quotedRate = midRate * (1 - markupPercent / 100);
        const targetAmount = sourceAmount * quotedRate;
        const fixedFee = config.fixedFee;
        const fxMargin = sourceAmount * (markupPercent / 100);
        const totalDebit = sourceAmount + fixedFee;
        const estimatedDelivery = new Date(Date.now() + config.hoursToDeliver * 60 * 60 * 1000);
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
            revenue: round(fxMargin + fixedFee, 2),
            rail: config.rail,
            deliveryMethod: method,
            hoursToDeliver: config.hoursToDeliver,
            estimatedDelivery,
            rateIsStale: stale,
            countryName: corridor.countryName,
        };
    }
    async listBeneficiaries(userId) {
        return this.beneficiaries.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }
    async createBeneficiary(userId, body) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Пользователь не найден');
        const { corridor } = this.findMethod(body.country, body.deliveryMethod);
        if (!body.name?.trim()) {
            throw new common_1.BadRequestException('Укажите имя получателя');
        }
        if (body.deliveryMethod === 'CARD') {
            const digits = (body.cardNumber || '').replace(/\D/g, '');
            if (digits.length < 12) {
                throw new common_1.BadRequestException('Укажите корректный номер карты');
            }
        }
        else if (!body.accountNumber?.trim()) {
            throw new common_1.BadRequestException('Укажите номер счёта');
        }
        const beneficiary = this.beneficiaries.create({
            user,
            name: body.name.trim(),
            type: body.type || 'INDIVIDUAL',
            country: body.country,
            currency: body.deliveryMethod === 'CARD' ? corridor.targetCurrency : 'USD',
            deliveryMethod: body.deliveryMethod,
            cardLast4: body.deliveryMethod === 'CARD'
                ? (body.cardNumber || '').replace(/\D/g, '').slice(-4)
                : null,
            bankName: body.bankName?.trim() || null,
            accountNumber: body.accountNumber?.trim() || null,
            swiftCode: body.swiftCode?.trim() || null,
        });
        return this.beneficiaries.save(beneficiary);
    }
    async createPayout(userId, body) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Пользователь не найден');
        const beneficiary = await this.beneficiaries.findOne({
            where: { id: body.beneficiaryId, user: { id: userId } },
        });
        if (!beneficiary)
            throw new common_1.NotFoundException('Получатель не найден');
        const quote = await this.quote({
            sourceCurrency: body.sourceCurrency,
            sourceAmount: body.sourceAmount,
            country: beneficiary.country,
            method: beneficiary.deliveryMethod,
        });
        const wallet = await this.wallets.findOne({
            where: { user: { id: userId } },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Кошелёк не найден');
        if (wallet.isFrozen) {
            throw new common_1.BadRequestException('Кошелёк заморожен, платежи недоступны');
        }
        if (Number(wallet.balance) < quote.totalDebit) {
            throw new common_1.BadRequestException(`Недостаточно средств. Нужно ${quote.totalDebit} ${quote.sourceCurrency}, доступно ${wallet.balance}`);
        }
        wallet.balance = round(Number(wallet.balance) - quote.totalDebit, 2);
        await this.wallets.save(wallet);
        const now = new Date();
        const firstEvent = {
            status: 'INITIATED',
            at: now.toISOString(),
            note: 'Payment created',
        };
        const payout = this.payouts.create({
            reference: 'STR-' + (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase(),
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
    advance(payout) {
        if (payout.status === 'COMPLETED' || payout.status === 'FAILED') {
            return payout;
        }
        const minutesPassed = (Date.now() - payout.createdAt.getTime()) / 60000;
        const reached = STATUS_FLOW.filter((s) => minutesPassed >= s.afterMinutes);
        if (!reached.length)
            return payout;
        const target = reached[reached.length - 1];
        if (target.status === payout.status)
            return payout;
        const known = new Set(payout.statusHistory.map((e) => e.status));
        const added = reached
            .filter((s) => !known.has(s.status))
            .map((s) => ({
            status: s.status,
            at: new Date(payout.createdAt.getTime() + s.afterMinutes * 60000).toISOString(),
            note: s.note,
        }));
        payout.status = target.status;
        payout.statusHistory = [...payout.statusHistory, ...added];
        return payout;
    }
    async getPayout(userId, reference) {
        const payout = await this.payouts.findOne({
            where: { reference, user: { id: userId } },
        });
        if (!payout)
            throw new common_1.NotFoundException('Платёж не найден');
        const before = payout.status;
        this.advance(payout);
        if (payout.status !== before)
            await this.payouts.save(payout);
        return payout;
    }
    async listPayouts(userId, page = 1, limit = 10) {
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
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payout_entity_1.Payout)),
    __param(1, (0, typeorm_1.InjectRepository)(beneficiary_entity_1.Beneficiary)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        fx_service_1.FxService])
], PayoutsService);
function round(value, decimals) {
    const f = Math.pow(10, decimals);
    return Math.round(value * f) / f;
}
//# sourceMappingURL=payouts.service.js.map