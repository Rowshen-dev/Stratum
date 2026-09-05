import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeliveryMethod } from './beneficiary.entity';
import { PayoutPurpose } from './payout.entity';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutsController {
  constructor(private payouts: PayoutsService) {}

  /** Доступные коридоры, валюты и каналы доставки. */
  @Get('corridors')
  corridors() {
    return this.payouts.getCorridors();
  }

  /** Расчёт курса, комиссии и суммы к зачислению. */
  @Post('quote')
  quote(
    @Body()
    body: {
      sourceCurrency: string;
      sourceAmount: number;
      country: string;
      method: DeliveryMethod;
    },
  ) {
    return this.payouts.quote(body);
  }

  @Get('beneficiaries')
  listBeneficiaries(@Req() req) {
    return this.payouts.listBeneficiaries(req.user.id);
  }

  @Post('beneficiaries')
  createBeneficiary(
    @Req() req,
    @Body()
    body: {
      name: string;
      type?: 'INDIVIDUAL' | 'BUSINESS';
      country: string;
      deliveryMethod: DeliveryMethod;
      cardNumber?: string;
      bankName?: string;
      accountNumber?: string;
      swiftCode?: string;
    },
  ) {
    return this.payouts.createBeneficiary(req.user.id, body);
  }

  @Post()
  create(
    @Req() req,
    @Body()
    body: {
      beneficiaryId: number;
      sourceCurrency: string;
      sourceAmount: number;
      purpose?: PayoutPurpose;
      invoiceReference?: string;
    },
  ) {
    return this.payouts.createPayout(req.user.id, body);
  }

  @Get()
  list(@Req() req, @Query('page') page: string, @Query('limit') limit: string) {
    return this.payouts.listPayouts(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Get(':reference')
  one(@Req() req, @Param('reference') reference: string) {
    return this.payouts.getPayout(req.user.id, reference);
  }
}
