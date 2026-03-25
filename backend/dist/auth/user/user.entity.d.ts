import { Role } from '../roles/role.enum';
export declare class User {
    id: number;
    email: string;
    password: string;
    role: Role;
    isBlocked: boolean;
}
