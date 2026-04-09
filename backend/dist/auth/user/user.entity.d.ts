import { Role } from '../roles/role.enum';
import { Wallet } from '../../wallet/wallet.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    balance: number;
    role: Role;
    isBlocked: boolean;
    wallet: Wallet;
}
