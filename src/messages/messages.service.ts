import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {ConversationMember} from "./entities/conversation-member.entity";
import {Message} from "./entities/message.entity";
import {Conversation} from "./entities/conversation.entity";
import {TaskGateway} from "../tasks/tasks.gateway";

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private messagesRepository: Repository<Message>,
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
        @InjectRepository(ConversationMember)
        private conversationMemberRepository: Repository<ConversationMember>,
        private taskGateway: TaskGateway,
    ) {}

    async createConversation(userId1: number, userId2: number) {
        const member1 = await this.conversationMemberRepository.find({
            where: { userId: userId1 }
        })
        const conversationIds = member1.map(m => m.conversationId)

        if (conversationIds.length > 0) {
            const existing = await this.conversationMemberRepository.findOne({
                where: { userId: userId2, conversationId: In(conversationIds) }
            })
            if (existing) return { conversationId: existing.conversationId }
        }

        const conversation = await this.conversationRepository.save({ type: 'direct' })

        await this.conversationMemberRepository.save([
            { conversationId: conversation.id, userId: userId1 },
            { conversationId: conversation.id, userId: userId2 },
        ])

        return { conversationId: conversation.id }
    }

    async sendMessage(conversationId: number, senderId: number, text: string) {
        const message = await this.messagesRepository.save({ conversationId, senderId, text })
        this.taskGateway.notifyNewMessage(message)

        await this.conversationRepository.update(conversationId, { lastMessageId: message.id })

        return message
    }

    async getMessages(conversationId: number) {
        return this.messagesRepository.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
            relations: ['sender']
        })
    }

    async getConversations(userId: number) {
        return this.conversationMemberRepository
            .createQueryBuilder('cm')
            .innerJoin(ConversationMember, 'other',
                'other.conversationId = cm.conversationId AND other.userId != :userId',
                { userId })
            .innerJoin('other.user', 'user')
            .select([
                'cm.conversationId AS "conversationId"',
                'user.id AS "interlocutorId"',
                'user.name AS "interlocutorName"',
                'user.avatar AS "interlocutorAvatar"',
                'user.email AS "interlocutorEmail"',
            ])
            .where('cm.userId = :userId', { userId })
            .getRawMany()
    }
}
