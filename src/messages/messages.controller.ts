import {Body, Request, Controller, Post, UseGuards, Get, Query} from '@nestjs/common';
import {MessagesService} from "./messages.service";
import {JwtAuthGuard} from "../common/guards/jwt-auth.guard";
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller('messages')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('conversation')
    createConversation(@Body() body: { receiverId: number }, @Request() req) {
        return this.messagesService.createConversation(req.user.id, body.receiverId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('conversationSendMessage')
    createConversationSendMessage(@Body() body: { conversationId: number, text: string }, @Request() req) {
        return this.messagesService.sendMessage(body.conversationId, req.user.id , body.text)
    }

    @UseGuards(JwtAuthGuard)
    @Get('conversationGetMessages')
    getConversationGetMessages(
        @Query('conversationId') conversationId: number,
        @Request() req
    ) {
        return this.messagesService.getMessages(Number(conversationId), req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('getConversations')
    getConversations(@Request() req) {
        return this.messagesService.getConversations(req.user.id)
    }
}
