import { Role } from '../roles/role.entity';
export declare class Permission {
    id: number;
    name: string;
    roles: Role[];
}
