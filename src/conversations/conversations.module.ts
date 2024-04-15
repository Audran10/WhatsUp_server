import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSchema } from './entities/conversation.entity';
import { ConversationsService } from './conversations.service';
import { ConversationsGateway } from './conversations.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Conversation', schema: ConversationSchema }]),
  ],
  providers: [ConversationsGateway, ConversationsService],
})
export class ConversationsModule {}
