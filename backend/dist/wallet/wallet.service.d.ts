import { Wallet } from './wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
export declare class WalletService {
    private transactionRepository;
    private walletRepository;
    constructor(transactionRepository: Repository<Transaction>, walletRepository: Repository<Wallet>);
    getBalance(userId: number): Promise<{
        balance: number;
    }>;
    sendMoney(fromUserId: number, toUserId: number, amount: number): Promise<{
        message: string;
        fee: number;
    }>;
    deposit(userId: number, amount: number): Promise<{
        message: string;
    }>;
    withdraw(userId: number, amount: number): Promise<{
        message: string;
    }>;
    adminChangeBalance(userId: number, amount: number): Promise<Wallet>;
}
