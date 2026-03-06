import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super( {
            jwtFromRequest: ExtractJwt. fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'access-secret',
        });
    }
    async validate(payload: any) {
        const user = await this.userRepository.findOne({
            where: { id: payload.userId },
            relations: ['roles', 'roles.permissions'],
        });

        return user;
    }
}