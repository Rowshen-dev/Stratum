import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user/user.entity';
export declare class TransactionsService {
    private transactionRepository;
    private userRepository;
    constructor(transactionRepository: Repository<Transaction>, userRepository: Repository<User>);
    getMyTransactions(userId: number, page?: number, limit?: number): Promise<{
        total: number;
        page: number;
        limit: number;
        data: ({
            type: string;
            amount: number;
            user: string;
            date: Date;
        } | null)[];
    }>;
    getAllTransactions(): Promise<Transaction[]>;
    transfer(fromUserId: number, toUserId: number, amount: number): Promise<Transaction>;
}
