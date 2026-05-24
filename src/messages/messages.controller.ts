import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/decorators/current-user.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('conversation')
  createConversation(
    @Body() body: { receiverId: number },
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.createConversation(user.id, body.receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversationSendMessage')
  createConversationSendMessage(
    @Body() body: { conversationId: number; text: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.sendMessage(
      body.conversationId,
      user.id,
      body.text,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversationGetMessages')
  getConversationGetMessages(
    @Query('conversationId') conversationId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.getMessages(Number(conversationId), user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getConversations')
  getConversations(@CurrentUser() user: AuthUser) {
    return this.messagesService.getConversations(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deleteConversationMessage/:messageId')
  deleteConversationMessage(
    @Param('messageId') messageId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.deleteMessage(messageId, user.id);
  }
}
