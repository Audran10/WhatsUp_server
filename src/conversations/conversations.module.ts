import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsGateway } from './conversations.gateway';

@Module({
  providers: [ConversationsGateway, ConversationsService],
})
export class ConversationsModule {}
