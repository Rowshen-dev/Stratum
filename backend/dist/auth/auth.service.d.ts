import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    refresh(refreshToken: string): Promise<{
        access_token: string;
    }>;
    private user;
    register(email: string, password: string): Promise<{
        message: string;
        email: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
