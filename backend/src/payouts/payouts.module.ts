import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { FxService } from './fx.service';
import { Payout } from './payout.entity';
import { Beneficiary } from './beneficiary.entity';
import { User } from '../auth/user/user.entity';
import { Wallet } from '../wallet/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payout, Beneficiary, User, Wallet])],
  controllers: [PayoutsController],
  providers: [PayoutsService, FxService],
  exports: [PayoutsService],
})
export class PayoutsModule {}
