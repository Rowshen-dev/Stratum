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
const user_entity_1 = require("../auth/user/user.entity");
const typeorm_3 = require("typeorm");
let WalletService = class WalletService {
    dataSource;
    transactionRepository;
    walletRepository;
    userRepository;
    constructor(dataSource, transactionRepository, walletRepository, userRepository) {
        this.dataSource = dataSource;
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
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
        const fromUser = await this.userRepository.findOne({
            where: { id: fromUserId },
        });
        const toUser = await this.userRepository.findOne({
            where: { id: toUserId },
        });
        if (!fromUser || !toUser) {
            throw new Error('USER NOT FOUND');
        }
        const fromWallet = await this.walletRepository.findOne({
            where: { user: { id: fromUserId } },
        });
        const toWallet = await this.walletRepository.findOne({
            where: { user: { id: toUserId } },
        });
        if (!fromWallet || !toWallet) {
            throw new Error('WALLET NOT FOUND');
        }
        if (amount <= 0) {
            throw new Error('INVALID AMOUNT');
        }
        if (fromWallet.balance < amount) {
            throw new Error('INSUFFICIENT FUNDS');
        }
        await this.dataSource.transaction(async (manager) => {
            const fromWallet = await manager.findOne(wallet_entity_1.Wallet, {
                where: { user: { id: fromUserId } },
            });
            const toWallet = await manager.findOne(wallet_entity_1.Wallet, {
                where: { user: { id: toUserId } },
            });
            if (!fromWallet || !toWallet) {
                throw new Error('WALLET NOT FOUND');
            }
            if (fromWallet.balance < amount) {
                throw new Error('INSUFFICIENT FUNDS');
            }
            fromWallet.balance -= amount;
            toWallet.balance += amount;
            await manager.save(fromWallet);
            await manager.save(toWallet);
            await manager.save(transaction_entity_1.Transaction, {
                fromUser: { id: fromUserId },
                toUser: { id: toUserId },
                amount: amount,
            });
        });
        return { message: 'TRANSFER SUCCESS' };
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
        if (wallet.user.isBlocked) {
            throw new Error('USER BLOCKED');
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
    async adminChangeBalance(userId, amount) {
        const wallet = await this.walletRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!wallet) {
            throw new Error('WALLET NOT FOUND');
        }
        wallet.balance += amount;
        return this.walletRepository.save(wallet);
    }
    async freezeWallet(userId) {
        const wallet = await this.walletRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!wallet)
            throw new Error('Wallet not found');
        wallet.isFrozen = true;
        await this.walletRepository.save(wallet);
        return { message: 'WALLET FROZEN' };
    }
    async unfreezeWallet(userId) {
        const wallet = await this.walletRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!wallet)
            throw new Error('Wallet not found');
        wallet.isFrozen = false;
        await this.walletRepository.save(wallet);
        return { message: 'WALLET UNFROZEN' };
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_3.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WalletService);
//# sourceMappingURL=wallet.service.js.map