import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
  @InjectRepository(Transaction)
  private transactionRepository: Repository<Transaction>,

  @InjectRepository(User)
  private userRepository: Repository<User>,
) {}

  async getMyTransactions(userId: number, page = 1, limit = 5) {
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
    if (!t.fromUser || !t.toUser) return null;

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

async transfer(fromUserId: number, toUserId: number, amount: number) {
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

  // списание
  fromUser.balance -= amount;

  // начисление
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

}