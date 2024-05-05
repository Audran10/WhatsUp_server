import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSchema } from './entities/conversation.entity';
import { ConversationsService } from './conversations.service';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationsController } from './conversations.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsGateway, ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
