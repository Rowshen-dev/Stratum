import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    blockUser(id: string): Promise<import("./user.entity").User>;
    unblockUser(id: string): Promise<import("./user.entity").User>;
    getAllUsers(): Promise<import("./user.entity").User[]>;
}
