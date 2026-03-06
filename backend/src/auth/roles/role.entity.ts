import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Jointable } from 'typeorm';
import { Permission } from '../permissions/permission.entity';
import { User } from '../user/user.entity';
import { permission } from 'process';

@Entity('roles')
export class Role {
@PrimaryGeneratedColumn()
id: number;

@Column({ unique: true })
name: string;
@ManyToMany(() => Permission, permission => permission.roles, { eager: true })
@Jointable()
permissions: Permission[];

@ManyToMany(() => User, user => user.roles)
users: User[];
}