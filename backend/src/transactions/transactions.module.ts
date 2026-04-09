import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { User } from 'src/auth/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User,])],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}