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
import { UsersModule } from './auth/user/users.module';


@Module({
  imports: [
 TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: [User, Role, Wallet, Transaction],
  synchronize: true,
  ssl: process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false,
} : false,

}),

    AuthModule,
    WalletModule,
    TransactionsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
