import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Transaction } from '../transactions/transaction.entity';
import { User } from 'src/auth/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, User, Transaction])],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}