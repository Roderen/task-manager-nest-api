import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from 'typeorm'
import {User} from "../../users/user.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    conversationId: number

    @ManyToOne(() => User)
    sender: User

    @Column()
    senderId: number

    @Column()
    text: string

    @CreateDateColumn()
    createdAt: Date

    @Column({ nullable: true })
    editedAt: Date

    @Column({ nullable: true })
    deletedAt: Date
}