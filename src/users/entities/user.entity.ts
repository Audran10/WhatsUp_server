import { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export const UserSchema = new Schema({
  pseudo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
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
  role: {
    type: String,
    default: 'user',
  },
});

export interface User extends Document {
  pseudo: string;
  email: string;
  phone: string;
  password: string;
  picture?: ObjectId;
  picture_url?: string;
  role: string;
}
