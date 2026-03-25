import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    getMyHistory(req: any): Promise<import("./transaction.entity").Transaction[]>;
    getAllTransactions(): Promise<import("./transaction.entity").Transaction[]>;
}
