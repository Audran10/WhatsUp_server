import { ObjectId } from 'mongoose';

export class CreateTicketDto {
  reporter: string;
  content: string;
  message_id: ObjectId;
  conversation_id: ObjectId;
  sender_username: string;
  sender_id: ObjectId;
}
