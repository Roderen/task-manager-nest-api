import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Not, Repository } from 'typeorm';
import { ConversationMember } from './entities/conversation-member.entity';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { TaskGateway } from '../tasks/tasks.gateway';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

interface ConversationRaw {
  conversationId: number;
  lastReadMessageId: number | null;
  interlocutorId: number;
  interlocutorName: string;
  interlocutorAvatar: string;
  interlocutorEmail: string;
}

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
      where: { userId: userId1 },
    });
    const conversationIds = member1.map((m) => m.conversationId);

    if (conversationIds.length > 0) {
      const existing = await this.conversationMemberRepository.findOne({
        where: { userId: userId2, conversationId: In(conversationIds) },
      });
      if (existing) return { conversationId: existing.conversationId };
    }

    const conversation = await this.conversationRepository.save({
      type: 'direct',
    });

    await this.conversationMemberRepository.save([
      { conversationId: conversation.id, userId: userId1 },
      { conversationId: conversation.id, userId: userId2 },
    ]);

    return { conversationId: conversation.id };
  }

  async sendMessage(conversationId: number, senderId: number, text: string) {
    const message = await this.messagesRepository.save({
      conversationId,
      senderId,
      text,
    });
    await this.taskGateway.notifyNewMessage(message);

    await this.conversationRepository.update(conversationId, {
      lastMessageId: message.id,
    });

    return message;
  }

  async getMessages(
    conversationId: number,
    userId: number,
    dto: CursorPaginationDto,
  ) {
    const { cursor, limit } = dto;
    const take = limit ?? 20;

    const conversationMember = await this.conversationMemberRepository.findOne({
      where: { conversationId, userId },
    });
    if (!conversationMember) throw new ForbiddenException('Access denied');

    const interlocutorMember = await this.conversationMemberRepository.findOne({
      where: { conversationId, userId: Not(userId) },
    });

    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.id', 'DESC')
      .limit(take + 1);

    if (cursor) {
      queryBuilder.andWhere('message.id < :cursor', { cursor: +cursor });
    }

    const messages = await queryBuilder.getMany();
    const hasMore = messages.length > take;
    if (hasMore) messages.pop();

    messages.reverse();

    return {
      messages,
      nextCursor: hasMore ? messages[0].id : null,
      interlocutorMember,
    };
  }

  async getConversations(userId: number) {
    const conversations = await this.conversationMemberRepository
      .createQueryBuilder('cm')
      .innerJoin(
        ConversationMember,
        'other',
        'other.conversationId = cm.conversationId AND other.userId != :userId',
        { userId },
      )
      .innerJoin('other.user', 'user')
      .select([
        'cm.conversationId AS "conversationId"',
        'cm.lastReadMessageId AS "lastReadMessageId"',
        'user.id AS "interlocutorId"',
        'user.name AS "interlocutorName"',
        'user.avatar AS "interlocutorAvatar"',
        'user.email AS "interlocutorEmail"',
      ])
      .where('cm.userId = :userId', { userId })
      .getRawMany<ConversationRaw>();

    return Promise.all(
      conversations.map(async (c) => ({
        ...c,
        unreadCount: await this.getUnreadCount(
          c.conversationId,
          userId,
          c.lastReadMessageId ?? 0,
        ),
        lastReadMessageId: undefined,
      })),
    );
  }

  async getUnreadCount(
    conversationId: number,
    userId: number,
    lastReadMessageId: number,
  ): Promise<number> {
    return this.messagesRepository.count({
      where: {
        conversationId,
        senderId: Not(userId),
        id: MoreThan(lastReadMessageId ?? 0),
      },
    });
  }

  async deleteMessage(messageId: number, userId: number) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId)
      throw new ForbiddenException('Not your message');

    message.deletedAt = new Date();
    return this.messagesRepository.save(message);
  }

  async editMessage(userId: number, messageId: number, text: string) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, senderId: userId },
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId)
      throw new ForbiddenException('Not your message');

    message.text = text;
    message.editedAt = new Date();
    this.taskGateway.notifyMessageEdited(message);
    return this.messagesRepository.save(message);
  }

  async markAsRead(conversationId: number, userId: number, messageId: number) {
    await this.conversationMemberRepository
      .createQueryBuilder()
      .update()
      .set({ lastReadMessageId: messageId })
      .where(
        'conversationId = :conversationId AND userId = :userId AND (lastReadMessageId IS NULL OR lastReadMessageId < :messageId)',
        { conversationId, userId, messageId },
      )
      .execute();
  }
}
