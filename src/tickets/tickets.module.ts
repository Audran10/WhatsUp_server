import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { JwtModule } from '@nestjs/jwt';
import { TicketSchema } from './entities/ticket.entity';
import 'dotenv/config';
import { ConversationsService } from 'src/conversations/conversations.service';
import { ConversationsController } from 'src/conversations/conversations.controller';
import { ConversationSchema } from 'src/conversations/entities/conversation.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Ticket', schema: TicketSchema },
      { name: 'Conversation', schema: ConversationSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [TicketsController, ConversationsController],
  providers: [TicketsService, ConversationsService],
})
export class TicketsModule {}
