import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
    register(dto: RegisterDto): Promise<import("./user/user.entity").User>;
    user(user: any): {
        message: string;
        user: any;
    };
    getProfile(req: any): any;
    admin(user: any): {
        message: string;
        user: any;
    };
    sendMoney(user: any): {
        message: string;
        user: any;
    };
}
