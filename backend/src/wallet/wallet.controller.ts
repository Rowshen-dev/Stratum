import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { Body, Post } from '@nestjs/common';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/role.enum';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  getBalance(@Req() req) {
    return this.walletService.getBalance(req.user.id);
  }

@UseGuards(JwtAuthGuard)
@Post('send')
sendMoney(@Req() req, @Body() body: { toUserId: number; amount: number }) {
  return this.walletService.sendMoney(
    req.user.id,
    body.toUserId,
    body.amount,
  );
}

@UseGuards(JwtAuthGuard)
@Post('deposit')
deposit(@Req() req, @Body() body) {
  return this.walletService.deposit(req.user.id, body.amount);
}

@UseGuards(JwtAuthGuard)
@Post('withdraw')
withdraw(@Req() req, @Body() body) {
  return this.walletService.withdraw(req.user.id, body.amount);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Post('admin/change-balance')
changeBalance(@Body() body: { userId: number; amount: number }) {
  return this.walletService.adminChangeBalance(body.userId, body.amount);
}

}