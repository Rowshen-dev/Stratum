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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("./transaction.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../auth/user/user.entity");
let TransactionsService = class TransactionsService {
    transactionRepository;
    userRepository;
    constructor(transactionRepository, userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }
    async getMyTransactions(userId, page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await this.transactionRepository
            .createQueryBuilder('t')
            .leftJoin('t.fromUser', 'fromUser')
            .leftJoin('t.toUser', 'toUser')
            .addSelect(['fromUser.id', 'fromUser.email'])
            .addSelect(['toUser.id', 'toUser.email'])
            .where('fromUser.id = :userId', { userId })
            .orWhere('toUser.id = :userId', { userId })
            .orderBy('t.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const data = transactions.map((t) => {
            if (!t.fromUser || !t.toUser)
                return null;
            const isSender = t.fromUser.id === userId;
            return {
                type: isSender ? 'SEND' : 'RECEIVE',
                amount: t.amount,
                user: isSender ? t.toUser.email : t.fromUser.email,
                date: t.createdAt,
            };
        }).filter(Boolean);
        return {
            total,
            page,
            limit,
            data,
        };
    }
    async getAllTransactions() {
        return this.transactionRepository.find({
            relations: ['fromUser', 'toUser'],
            order: { createdAt: 'DESC' },
        });
    }
    async transfer(fromUserId, toUserId, amount) {
        if (fromUserId === toUserId) {
            throw new Error('Cannot send to yourself');
        }
        const fromUser = await this.userRepository.findOne({
            where: { id: fromUserId },
        });
        const toUser = await this.userRepository.findOne({
            where: { id: toUserId },
        });
        if (!fromUser) {
            throw new Error('Sender not found');
        }
        if (!toUser) {
            throw new Error('Receiver not found');
        }
        if (!toUser) {
            throw new Error('Receiver not found');
        }
        if (fromUser.balance < amount) {
            throw new Error('Not enough balance');
        }
        fromUser.balance -= amount;
        toUser.balance += amount;
        await this.userRepository.save(fromUser);
        await this.userRepository.save(toUser);
        const transaction = this.transactionRepository.create({
            amount,
            fromUser,
            toUser,
        });
        return this.transactionRepository.save(transaction);
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map