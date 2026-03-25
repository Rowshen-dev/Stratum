import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
export declare class TransactionsService {
    private transactionRepository;
    constructor(transactionRepository: Repository<Transaction>);
    getMyTransactions(userId: number): Promise<Transaction[]>;
    getAllTransactions(): Promise<Transaction[]>;
}
