import { User } from '../auth/user/user.entity';
export declare class Wallet {
    id: number;
    balance: number;
    isFrozen: boolean;
    user: User;
}
