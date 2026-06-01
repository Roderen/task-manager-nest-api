import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/decorators/current-user.decorator';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

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
    @Query() CursorPaginationDto: CursorPaginationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.getMessages(
      Number(conversationId),
      user.id,
      CursorPaginationDto,
    );
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

  @UseGuards(JwtAuthGuard)
  @Put('editConversationMessage/:messageId')
  editConversationMessage(
    @Param('messageId') messageId: number,
    @Body('text') text: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.editMessage(user.id, messageId, text);
  }

  @UseGuards(JwtAuthGuard)
  @Post('markAsRead')
  async markAsRead(
    @Body('conversationId') conversationId: number,
    @Body('messageId') messageId: number,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.messagesService.markAsRead(conversationId, user.id, messageId);
  }
}
