import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';


@Injectable()
export class WalletService {
  constructor(

    @InjectRepository(Transaction)
private transactionRepository: Repository<Transaction>,

    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
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

  if (!fromWallet) {
  throw new Error('WALLET NOT FOUND');
}

if (fromWallet.user.isBlocked) {
  throw new Error('USER BLOCKED');
}
   
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
  fromUser: fromWallet!.user,
toUser: toWallet!.user,
  amount: amount,
  createdAt: new Date(),
});

  return { message: 'OK', fee: fee, };
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

}