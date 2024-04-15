import { ObjectId } from "mongodb";

export class CreateMessageDto {
    senderId: ObjectId;
    content: string;
    created_at: Date;
}