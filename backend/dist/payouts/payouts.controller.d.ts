import { PayoutsService } from './payouts.service';
import { DeliveryMethod } from './beneficiary.entity';
import { PayoutPurpose } from './payout.entity';
export declare class PayoutsController {
    private payouts;
    constructor(payouts: PayoutsService);
    corridors(): import("./payouts.service").CorridorConfig[];
    quote(body: {
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
    listBeneficiaries(req: any): Promise<import("./beneficiary.entity").Beneficiary[]>;
    createBeneficiary(req: any, body: {
        name: string;
        type?: 'INDIVIDUAL' | 'BUSINESS';
        country: string;
        deliveryMethod: DeliveryMethod;
        cardNumber?: string;
        bankName?: string;
        accountNumber?: string;
        swiftCode?: string;
    }): Promise<import("./beneficiary.entity").Beneficiary>;
    create(req: any, body: {
        beneficiaryId: number;
        sourceCurrency: string;
        sourceAmount: number;
        purpose?: PayoutPurpose;
        invoiceReference?: string;
    }): Promise<import("./payout.entity").Payout>;
    list(req: any, page: string, limit: string): Promise<{
        total: number;
        page: number;
        limit: number;
        data: import("./payout.entity").Payout[];
    }>;
    one(req: any, reference: string): Promise<import("./payout.entity").Payout>;
}
