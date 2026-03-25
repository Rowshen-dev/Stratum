import { User } from '../auth/user/user.entity';
export declare class Transaction {
    id: number;
    fromUser: User | null;
    toUser: User | null;
    amount: number;
    createdAt: Date;
}
