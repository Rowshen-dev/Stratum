"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wallet_entity_1 = require("./wallet.entity");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../transactions/transaction.entity");
let WalletService = class WalletService {
    transactionRepository;
    walletRepository;
    constructor(transactionRepository, walletRepository) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }
    async getBalance(userId) {
        const wallet = await this.walletRepository.findOne({
            where: { user: { id: userId } },
        });
        return {
            balance: wallet?.balance || 0,
        };
    }
    async sendMoney(fromUserId, toUserId, amount) {
        if (amount <= 0) {
            throw new Error('INVALID AMOUNT');
        }
        if (amount > 100000) {
            throw new Error('LIMIT EXCEEDED');
        }
        console.log('FROM:', fromUserId);
        console.log('TO:', toUserId);
        console.log('AMOUNT:', amount);
        const fromWallet = await this.walletRepository.findOne({
            where: { user: { id: fromUserId } },
            relations: ['user'],
        });
        const toWallet = await this.walletRepository.findOne({
            where: { user: { id: toUserId } },
            relations: ['user'],
        });
        console.log('FROM WALLET:', fromWallet);
        console.log('TO WALLET:', toWallet);
        if (!fromWallet) {
            throw new Error('FROM WALLET NOT FOUND');
        }
        if (!toWallet) {
            throw new Error('TO WALLET NOT FOUND');
        }
        if (fromWallet.balance < amount) {
            throw new Error('NOT ENOUGH MONEY');
        }
        const fee = amount * 0.01;
        const total = amount + fee;
        if (fromWallet.balance < total) {
            throw new Error('NOT ENOUGH MONEY (WITH FEE)');
        }
        fromWallet.balance -= total;
        toWallet.balance += amount;
        await this.walletRepository.save(fromWallet);
        await this.walletRepository.save(toWallet);
        await this.transactionRepository.save({
            fromUser: fromWallet.user,
            toUser: toWallet.user,
            amount: amount,
            createdAt: new Date(),
        });
        return { message: 'OK', fee: fee, };
    }
    async deposit(userId, amount) {
        const wallet = await this.walletRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!wallet) {
            throw new Error('WALLET NOT FOUND');
        }
        wallet.balance += amount;
        await this.walletRepository.save(wallet);
        await this.transactionRepository.save({
            fromUser: null,
            toUser: wallet.user,
            amount: amount,
            createdAt: new Date(),
        });
        return { message: 'DEPOSIT SUCCESS' };
    }
    async withdraw(userId, amount) {
        if (amount <= 0) {
            throw new Error('INVALID AMOUNT');
        }
        if (amount > 100000) {
            throw new Error('LIMIT EXCEEDED');
        }
        const wallet = await this.walletRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!wallet) {
            throw new Error('WALLET NOT FOUND');
        }
        if (wallet.balance < amount) {
            throw new Error('NOT ENOUGH MONEY');
        }
        const fee = amount * 0.01;
        const total = amount + fee;
        if (wallet.balance < total) {
            throw new Error('NOT ENOUGH MONEY (WITH FEE)');
        }
        wallet.balance -= total;
        await this.walletRepository.save(wallet);
        await this.transactionRepository.save({
            fromUser: wallet.user,
            toUser: null,
            amount: amount,
            createdAt: new Date(),
        });
        return { message: 'WITHDRAW SUCCESS' };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WalletService);
//# sourceMappingURL=wallet.service.js.map