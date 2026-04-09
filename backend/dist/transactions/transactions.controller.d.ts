import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    getMy(req: any, page: string, limit: string): Promise<{
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
    getAllTransactions(): Promise<import("./transaction.entity").Transaction[]>;
    transfer(req: any, body: {
        toUserId: number;
        amount: number;
    }): Promise<import("./transaction.entity").Transaction>;
}
