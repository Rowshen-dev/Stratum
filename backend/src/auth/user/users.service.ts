import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async blockUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new Error('USER NOT FOUND');
    }

    user.isBlocked = true;

    return this.userRepository.save(user);
  }

  async unblockUser(id: number) {
  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new Error('USER NOT FOUND');
  }

  user.isBlocked = false;

  return this.userRepository.save(user);
}

async getAllUsers() {
return this.userRepository.find();
}

async findById(id: number) {
  return this.userRepository.findOne({
    where: { id },
  });
}
}