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
  profile_picture: {
    type: Schema.Types.ObjectId,
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
  profile_picture: ObjectId;
  role: string;
}
