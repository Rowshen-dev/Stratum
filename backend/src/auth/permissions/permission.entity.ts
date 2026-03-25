import { Entity, PrimaryGeneratedColumn, Column, ManyToMany} from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ unique: true })
    name: string;

  
    roles: Role[];
}