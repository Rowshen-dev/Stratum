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
        refresh_token: string;
    }>;
    refresh(authHeader: string): Promise<{
        access_token: string;
    }>;
    register(dto: RegisterDto): Promise<{
        message: string;
        email: string;
    }>;
    profile(user: any): {
        message: string;
        user: any;
    };
    user(user: any): {
        message: string;
        user: any;
    };
    getProfile(user: any): {
        message: string;
        user: any;
    };
    admin(user: any): {
        message: string;
        user: any;
    };
    sendMoney(user: any): {
        message: string;
        user: any;
    };
}
