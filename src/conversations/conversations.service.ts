import { Injectable, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './entities/conversation.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(@InjectModel('Conversation') private conversationModel: Model<Conversation>) {}
  createDiscussion(createConversationDto: CreateConversationDto) {
    const createdConversation = new this.conversationModel(createConversationDto);
    return createdConversation.save();
  }

  async createMessage(conversationId: string, createMessageDto: CreateMessageDto) {
    const conversation = await this.conversationModel.findById(conversationId).exec();
    const newMessage = {
      senderId: createMessageDto.senderId,
      content: createMessageDto.content,
      created_at: createMessageDto.created_at || new Date(),
    };
    conversation.messages.push(newMessage);
    return conversation.save();
  }

  findAll() {
    return this.conversationModel.find().exec();
  }

  findOne(id: number) {
    return this.conversationModel.findById(id).exec();
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return this.conversationModel.findByIdAndDelete(id).exec();
  }
}
