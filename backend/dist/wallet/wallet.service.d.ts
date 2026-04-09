import { Wallet } from './wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { User } from 'src/auth/user/user.entity';
import { DataSource } from 'typeorm';
export declare class WalletService {
    private readonly dataSource;
    private transactionRepository;
    private walletRepository;
    private userRepository;
    constructor(dataSource: DataSource, transactionRepository: Repository<Transaction>, walletRepository: Repository<Wallet>, userRepository: Repository<User>);
    getBalance(userId: number): Promise<{
        balance: number;
    }>;
    sendMoney(fromUserId: number, toUserId: number, amount: number): Promise<{
        message: string;
    }>;
    deposit(userId: number, amount: number): Promise<{
        message: string;
    }>;
    withdraw(userId: number, amount: number): Promise<{
        message: string;
    }>;
    adminChangeBalance(userId: number, amount: number): Promise<Wallet>;
    freezeWallet(userId: number): Promise<{
        message: string;
    }>;
    unfreezeWallet(userId: number): Promise<{
        message: string;
    }>;
}
