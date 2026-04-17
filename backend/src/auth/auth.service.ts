import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from './roles/role.enum';
import { User } from './user/user.entity';
import { Wallet } from '../wallet/wallet.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,

    @InjectRepository(Wallet)
private walletRepository: Repository<Wallet>,
  ) {}

 async register(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  // 👉 создаём пользователя
  const user = await this.userRepository.save({
    email,
    password: hashedPassword,
  });

  // 👉 создаём wallet ПРАВИЛЬНО
  const wallet = this.walletRepository.create({
    user: user,   // ⚠️ ВАЖНО: через create!
    balance: 0,
  });

  await this.walletRepository.save(wallet);

  return user;
}

  async login(email: string, password: string) {

    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new Error('Invalid password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };


    return {
      access_token: this.jwtService.sign(payload),
    };
  }

}