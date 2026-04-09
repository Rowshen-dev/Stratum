import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../roles/role.enum';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 1000 })
balance: number;

@Column ({
type: 'enum',
enum: Role,
default: Role.USER,
})
role:Role;

@Column({ default: false })
isBlocked: boolean;

}