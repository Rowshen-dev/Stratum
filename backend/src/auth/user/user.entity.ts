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

@Column ({
type: 'enum',
enum: Role,
default: Role.USER,
})
role:Role;

@Column({ default: false })
isBlocked: boolean;

}