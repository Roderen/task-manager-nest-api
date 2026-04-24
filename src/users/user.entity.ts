import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import {Exclude} from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    email: string

    @Column()
    @Exclude()
    password: string

    @Column({nullable: true})
    name: string

    @Column({nullable: true})
    avatar: string
}