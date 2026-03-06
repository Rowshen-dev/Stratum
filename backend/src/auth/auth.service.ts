import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor (private jwtService: JwtService) {}

    async refresh(refreshToken: string) {
        try {
            console.log('REFRESH TOKEN:', refreshToken);

            const token = refreshToken.startsWith('Bearer ')
            ? refreshToken.replace('Bearer', '')
            :refreshToken;

            const payload = this.jwtService.verify(token, {
                    secret: 'refresh-secret',
                });
            const access_token = this.jwtService.sign(
                {
                    userId: payload.userId,
                    email: payload.email,
                },
                {
                    secret: 'access-secret',
                    expiresIn: '15m',
                },
            );
            return { access_token };
        } catch(e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private user = {
        id:1,
        email: 'test@mail.com',
        passwordHash: bcrypt.hashSync('123456', 10),
    };
   

    async register(email: string, password: string) {
    if( !email || !password ) {
        throw new Error('Email and password required');
    }
    return {
        message: 'User registered succesfully',
        email,
    };
}

    async login(email: string, password: string) {
        if(email !== this.user.email) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = bcrypt.compareSync(
            password,
            this.user.passwordHash,
        );
        if(!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = {
            userId: this.user.id,
            email: this.user.email,
            role: 'user',
        };
        const access_token = this.jwtService.sign(payload, {
            secret: 'access-secret',
            expiresIn: '15m',
        });
        const refresh_token = this.jwtService.sign(
             {
                userId: this.user.id,
                email: this.user.email,
             },

             {
            secret: 'refresh-secret',
            expiresIn: '7d',
             },
        );
        return {
            access_token,
            refresh_token,
        };
    }
}
      