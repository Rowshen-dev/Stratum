import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';

import { User } from '../user/user.entity';


@Entity('roles')
export class Role {
    
@PrimaryGeneratedColumn()
id: number;

@Column({ unique: true })
name: string;


@ManyToMany(() => User, user => user.role)
users: User[];
}