import { Controller, Get, UseGuards, Req, Body, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { Query } from '@nestjs/common';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
 @Get('history')
getMy(@Req() req, @Query('page') page: string, @Query('limit') limit: string) {
  return this.transactionsService.getMyTransactions(
    req.user.id,
    Number(page) || 1,
    Number(limit) || 5,
  );
}
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Get('all')
getAllTransactions() {
  return this.transactionsService.getAllTransactions();
}

@Post('transfer')
@UseGuards(JwtAuthGuard)
transfer(
  @Req() req,
  @Body() body: { toUserId: number; amount: number },
) {
  return this.transactionsService.transfer(
    req.user.id,
    body.toUserId,
    body.amount,
  );
}

}