import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { ObjectId } from 'mongoose';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  reporter: string;
  content: string;
  message_id: ObjectId;
  conversation_id: ObjectId;
  sender_uername: string;
  sender_id: ObjectId;
}
