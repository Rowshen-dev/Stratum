import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { User } from 'src/auth/user/user.entity';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';


@Injectable()
export class WalletService {
  constructor(
    
    private readonly dataSource: DataSource,

    @InjectRepository(Transaction)
private transactionRepository: Repository<Transaction>,

    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

     @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getBalance(userId: number) {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    return {
      balance: wallet?.balance || 0,
    };
  }

 async sendMoney(fromUserId: number, toUserId: number, amount: number) {

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

  // 💸 перевод
  await this.dataSource.transaction(async (manager) => {

  const fromWallet = await manager.findOne(Wallet, {
    where: { user: { id: fromUserId } },
  });

  const toWallet = await manager.findOne(Wallet, {
    where: { user: { id: toUserId } },
  });

  if (!fromWallet || !toWallet) {
    throw new Error('WALLET NOT FOUND');
  }

  if (fromWallet.balance < amount) {
    throw new Error('INSUFFICIENT FUNDS');
  }

  // списание / начисление
  fromWallet.balance -= amount;
  toWallet.balance += amount;

  await manager.save(fromWallet);
  await manager.save(toWallet);

  // транзакция
  await manager.save(Transaction, {
    fromUser: { id: fromUserId },
    toUser: { id: toUserId },
    amount: amount,
  });

});
  return { message: 'TRANSFER SUCCESS' };
}

async deposit(userId: number, amount: number) {
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

async withdraw(userId: number, amount: number) {
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

async adminChangeBalance(userId: number, amount: number) {
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

async freezeWallet(userId: number) {
  const wallet = await this.walletRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });

  if (!wallet) throw new Error('Wallet not found');

  wallet.isFrozen = true;
  await this.walletRepository.save(wallet);

  return { message: 'WALLET FROZEN' };
}

async unfreezeWallet(userId: number) {
  const wallet = await this.walletRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });

  if (!wallet) throw new Error('Wallet not found');

  wallet.isFrozen = false;
  await this.walletRepository.save(wallet);

  return { message: 'WALLET UNFROZEN' };
}

}