import {Module} from '@nestjs/common';
import {MessagesService} from './messages.service';
import {MessagesController} from './messages.controller';
import {Message} from "./entities/message.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Conversation} from "./entities/conversation.entity";
import {ConversationMember} from "./entities/conversation-member.entity";
import {TasksModule} from "../tasks/tasks.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Conversation, ConversationMember]),
        TasksModule
    ],
    providers: [MessagesService],
    controllers: [MessagesController]
})
export class MessagesModule {
}
