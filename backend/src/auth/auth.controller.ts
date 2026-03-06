import { Controller, Post, Body, Get, UseGuards, Request, Headers } from '@nestjs/common';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.decorator';
import { CurrentUser } from './common/current-user.decorator';
import { Role } from './roles/role.enum';
import { PermissionsGuard } from './permissions/permissions.guard';
import { Permissions } from './permissions/permission.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    login(@Body() body: {email: string; password: string }){
        return this.authService.login(body.email, body.password);
    }
    @Post('refresh')
    refresh(@Headers('authorization') authHeader: string) {
        return this.authService.refresh(authHeader);
    }
    @Post('register')
    register (@Body() dto: RegisterDto) {
        return this.authService.register(dto.email, dto.password);

    }
    
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@CurrentUser() user){
        return {
            message: 'Ты прощел JWT защиту',
            user: user,
        };
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
    getProfile(@CurrentUser() user) {
        return {
            message: 'Ты прощёл JWT защиту !!!',
            user: user,
        };
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