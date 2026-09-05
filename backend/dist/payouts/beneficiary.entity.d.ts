import { User } from '../auth/user/user.entity';
export type BeneficiaryType = 'INDIVIDUAL' | 'BUSINESS';
export type DeliveryMethod = 'CARD' | 'BANK';
export declare class Beneficiary {
    id: number;
    user: User;
    name: string;
    type: BeneficiaryType;
    country: string;
    currency: string;
    deliveryMethod: DeliveryMethod;
    cardLast4: string | null;
    bankName: string | null;
    accountNumber: string | null;
    swiftCode: string | null;
    createdAt: Date;
}
