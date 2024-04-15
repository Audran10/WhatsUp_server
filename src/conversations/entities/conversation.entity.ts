import { Schema, Document } from 'mongoose';
import { ObjectId } from 'mongodb'; 

export const ConversationSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    users: {
        type: [ObjectId],
        required: true,
    },
    messages: [{
        senderId: {
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
        }
    }],
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

export interface Conversation extends Document {
    name: string;
    users: ObjectId[];
    messages: {
        senderId: ObjectId;
        content: string;
        created_at: Date;
    }[];
    created_at: Date;
    updated_at: Date;
}


