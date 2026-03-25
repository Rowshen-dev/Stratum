import { Controller, Post, Body, Request, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.decorator';
import { CurrentUser } from './common/current-user.decorator';
import { Role } from './roles/role.enum';
import { PermissionsGuard } from './permissions/permissions.guard';
import { Permissions } from './permissions/permission.decorator';
import { UseGuards, Get, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    
    @Post('login')
    login(@Body() body: {email: string; password: string }){
        return this.authService.login(body.email, body.password);
    }

        /*
    @Post('refresh')
    refresh(@Headers('authorization') authHeader: string) {
        return this.authService.refresh(authHeader);
    }*/
    @Post('register')
    register (@Body() dto: RegisterDto) {
        return this.authService.register(dto.email, dto.password);

    }
   
 @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('user')
    @Roles(Role.USER)
    user(@CurrentUser() user){
        return{
            message: 'Ты обычный пользователь',
            user: user,
        };
    }
    
    
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req) {
  return req.user;
}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('admin')
    admin(@CurrentUser() user) {
        return {
            message: 'Ты админ',
            user: user,
        };
    }
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('wallet:send')
    @Get('send-money')
    sendMoney(@CurrentUser() user) {
        return {
            message: 'Ты можешь отправлять деньги',
            user: user,
        };
    }
}