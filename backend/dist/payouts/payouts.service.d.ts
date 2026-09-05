import { Repository } from 'typeorm';
import { FxService } from './fx.service';
import { Beneficiary, DeliveryMethod } from './beneficiary.entity';
import { Payout, PayoutPurpose } from './payout.entity';
import { User } from '../auth/user/user.entity';
import { Wallet } from '../wallet/wallet.entity';
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
export declare const CORRIDORS: Record<string, CorridorConfig>;
export declare class PayoutsService {
    private payouts;
    private beneficiaries;
    private users;
    private wallets;
    private fx;
    constructor(payouts: Repository<Payout>, beneficiaries: Repository<Beneficiary>, users: Repository<User>, wallets: Repository<Wallet>, fx: FxService);
    getCorridors(): CorridorConfig[];
    private findMethod;
    quote(params: {
        sourceCurrency: string;
        sourceAmount: number;
        country: string;
        method: DeliveryMethod;
    }): Promise<{
        sourceCurrency: string;
        sourceAmount: number;
        targetCurrency: string;
        targetAmount: number;
        midRate: number;
        quotedRate: number;
        markupPercent: number;
        fixedFee: number;
        totalDebit: number;
        revenue: number;
        rail: string;
        deliveryMethod: DeliveryMethod;
        hoursToDeliver: number;
        estimatedDelivery: Date;
        rateIsStale: boolean;
        countryName: string;
    }>;
    listBeneficiaries(userId: number): Promise<Beneficiary[]>;
    createBeneficiary(userId: number, body: {
        name: string;
        type?: 'INDIVIDUAL' | 'BUSINESS';
        country: string;
        deliveryMethod: DeliveryMethod;
        cardNumber?: string;
        bankName?: string;
        accountNumber?: string;
        swiftCode?: string;
    }): Promise<Beneficiary>;
    createPayout(userId: number, body: {
        beneficiaryId: number;
        sourceCurrency: string;
        sourceAmount: number;
        purpose?: PayoutPurpose;
        invoiceReference?: string;
    }): Promise<Payout>;
    private advance;
    getPayout(userId: number, reference: string): Promise<Payout>;
    listPayouts(userId: number, page?: number, limit?: number): Promise<{
        total: number;
        page: number;
        limit: number;
        data: Payout[];
    }>;
}
