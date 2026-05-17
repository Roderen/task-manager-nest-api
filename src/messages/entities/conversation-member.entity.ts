import {Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Conversation} from "./conversation.entity";

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

    @Column({ nullable: true })
    lastReadMessageId: number

    @CreateDateColumn()
    joinedAt: Date
}