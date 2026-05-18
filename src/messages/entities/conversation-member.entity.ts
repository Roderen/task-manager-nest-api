import {Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Conversation} from "./conversation.entity";
import {User} from "../../users/user.entity";

@Entity()
export class ConversationMember {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    conversationId: number

    @ManyToOne(() => Conversation)
    conversation: Conversation

    @Column()
    userId: number

    @ManyToOne(() => User) user: User

    @Column({ nullable: true })
    lastReadMessageId: number

    @CreateDateColumn()
    joinedAt: Date
}