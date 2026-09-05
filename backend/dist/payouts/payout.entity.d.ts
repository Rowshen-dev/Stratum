import { User } from '../auth/user/user.entity';
import { Beneficiary } from './beneficiary.entity';
export type PayoutStatus = 'INITIATED' | 'COMPLIANCE_CHECK' | 'PROCESSING' | 'SENT_TO_PARTNER' | 'COMPLETED' | 'FAILED';
export type PayoutPurpose = 'CONTRACTOR_PAYMENT' | 'SUPPLIER_INVOICE' | 'SERVICES' | 'SALARY';
export interface StatusEvent {
    status: PayoutStatus;
    at: string;
    note: string;
}
export declare class Payout {
    id: number;
    reference: string;
    user: User;
    beneficiary: Beneficiary;
    sourceCurrency: string;
    sourceAmount: number;
    targetCurrency: string;
    targetAmount: number;
    midRate: number;
    quotedRate: number;
    markupPercent: number;
    fixedFee: number;
    totalDebit: number;
    purpose: PayoutPurpose;
    invoiceReference: string | null;
    status: PayoutStatus;
    statusHistory: StatusEvent[];
    estimatedDelivery: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
