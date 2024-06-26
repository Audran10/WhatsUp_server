import { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from 'src/users/entities/user.entity';

export const ConversationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  users: {
    type: [ObjectId],
    ref: 'User',
    required: true,
  },
  picture: {
    type: ObjectId,
    required: false,
  },
  picture_url: {
    type: String,
    required: false,
  },
  messages: [
    {
      _id: {
        type: ObjectId,
        required: true,
      },
      sender_id: {
        type: ObjectId,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      created_at: {
        type: Date,
        required: false,
        default: Date.now,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  owned_by: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
});

export interface Conversation extends Document {
  name: string;
  users: User[];
  picture?: ObjectId;
  picture_url?: string;
  messages?: {
    _id: ObjectId;
    sender_id: ObjectId;
    content: string;
    created_at: Date;
  }[];
  created_at: Date;
  updated_at: Date;
  owned_by: ObjectId;
}
