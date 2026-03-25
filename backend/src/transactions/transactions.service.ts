import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getMyTransactions(userId: number) {
    return this.transactionRepository.find({
      where: [
        { fromUser: { id: userId } },
        { toUser: { id: userId } },
      ],
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
    });
  }
  async getAllTransactions() {
  return this.transactionRepository.find({
    relations: ['fromUser', 'toUser'],
    order: { createdAt: 'DESC' },
  });
}
}