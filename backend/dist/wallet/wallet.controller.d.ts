import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        balance: number;
    }>;
    sendMoney(req: any, body: {
        toUserId: number;
        amount: number;
    }): Promise<{
        message: string;
        fee: number;
    }>;
    deposit(req: any, body: any): Promise<{
        message: string;
    }>;
    withdraw(req: any, body: any): Promise<{
        message: string;
    }>;
    changeBalance(body: {
        userId: number;
        amount: number;
    }): Promise<import("./wallet.entity").Wallet>;
}
