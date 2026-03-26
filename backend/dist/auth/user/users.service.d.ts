import { User } from './user.entity';
import { Repository } from 'typeorm';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    blockUser(id: number): Promise<User>;
    unblockUser(id: number): Promise<User>;
    getAllUsers(): Promise<User[]>;
}
