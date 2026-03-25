import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet/wallet.entity';
import { User } from './auth/user/user.entity';
import { Role } from './auth/roles/role.entity';
import { WalletModule } from './wallet/wallet.module';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';


@Module({
  imports: [
   TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'cortex',

  entities: [User, Role, Wallet, Transaction],

  synchronize: true,
}),
    AuthModule,
    WalletModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
