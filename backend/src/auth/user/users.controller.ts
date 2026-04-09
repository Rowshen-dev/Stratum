import { Controller, Post, Param, UseGuards, Get, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('block/:id')
  blockUser(@Param('id') id: string) {
    return this.usersService.unblockUser(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('unblock/:id')
  unblockUser(@Param('id') id: string) {
    return this.usersService.unblockUser(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Get()
getAllUsers() {
  return this.usersService.getAllUsers();
}

@Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@Request() req) {
  return this.usersService.findById(req.user.id);
}


}