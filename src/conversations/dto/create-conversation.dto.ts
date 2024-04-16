import { ObjectId } from 'mongodb';

export class CreateConversationDto {
    name: string;
    users: ObjectId[];
}
