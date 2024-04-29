import { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export const TicketSchema = new Schema({
  reporter: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  message_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  conversation_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  sender_username: {
    type: String,
    required: true,
  },
  sender_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export interface Ticket extends Document {
  reporter: string;
  content: string;
  message_id: ObjectId;
  conversation_id: ObjectId;
  sender_username: string;
  sender_id: ObjectId;
}
