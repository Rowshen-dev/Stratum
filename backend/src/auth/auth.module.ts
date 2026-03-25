import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Wallet } from 'src/wallet/wallet.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user/user.entity';
import { JwtStrategy } from './jwt/jwt.strategy';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet]),
    JwtModule.register({
      secret: 'access-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}