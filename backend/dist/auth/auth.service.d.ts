import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user/user.entity';
import { Wallet } from '../wallet/wallet.entity';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private walletRepository;
    constructor(userRepository: Repository<User>, jwtService: JwtService, walletRepository: Repository<Wallet>);
    register(email: string, password: string): Promise<{
        email: string;
        password: string;
    } & User>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
}
