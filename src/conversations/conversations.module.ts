import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSchema } from './entities/conversation.entity';
import { ConversationsService } from './conversations.service';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationsController } from './conversations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Conversation', schema: ConversationSchema }]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsGateway, ConversationsService],
})
export class ConversationsModule {}
