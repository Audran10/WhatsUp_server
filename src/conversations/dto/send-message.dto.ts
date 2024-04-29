import { ObjectId } from 'mongodb';

export class SendMessageDto {
  content: string;
  sender_id: ObjectId;
  conversation_id: string;
}
