import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel('Conversation') private conversationModel: Model<Conversation>,
  ) {}

  createConversation(createConversationDto: CreateConversationDto) {
    const newConversation = new this.conversationModel(createConversationDto);
    return newConversation.save();
  }

  findMyConversations(userId: ObjectId) {
    return this.conversationModel.find({ users: userId });
  }

  findAll() {
    return `This action returns all conversations`;
  }

  findOne(id: number) {
    return this.conversationModel.findById(id);
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
