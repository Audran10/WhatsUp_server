import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ObjectId, GridFSBucket, GridFSBucketWriteStream } from 'mongodb';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import 'dotenv/config';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  private gridFsBucket: GridFSBucket;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel('Conversation') private conversationModel: Model<Conversation>,
  ) {
    this.gridFsBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'Music',
    });
  }

  async createConversation(
    createConversationDto: CreateConversationDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const user = (await this.connection
      .model('User')
      .findOne({ _id: userId })
      .exec()) as unknown as User;
    createConversationDto.users.push(user.phone);
    const users = (await this.connection
      .model('User')
      .find({ phone: createConversationDto.users })
      .exec()) as unknown as User[];
    if (createConversationDto.name === undefined) {
      createConversationDto.name = users.map((user) => user.pseudo).join(', ');
    }
    const conversation = {
      name: createConversationDto.name,
      users: users.map((user) => user._id),
      owned_by: user._id,
    } as { name: string; users: ObjectId[]; owned_by: ObjectId };

    const newConversation = await new this.conversationModel(
      conversation,
    ).save();
    if (file) {
      const picture = await this.saveFileToGridFS(file);
      newConversation.picture = picture;
      newConversation.picture_url = `${process.env.CDN_URL}/conversations/${newConversation._id}/picture`;
      return newConversation.save();
    }
    return newConversation;
  }

  async saveFileToGridFS(file: Express.Multer.File): Promise<ObjectId> {
    const fileName = file.originalname;
    const contentType = file.mimetype;

    const writeStream: GridFSBucketWriteStream =
      this.gridFsBucket.openUploadStream(fileName, {
        contentType,
      });

    writeStream.write(file.buffer);
    writeStream.end();

    return new Promise<ObjectId>((resolve, reject) => {
      writeStream.on('finish', () => {
        resolve(writeStream.id);
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async findMyConversations(userId: ObjectId) {
    const conversations = await this.conversationModel
      .find({ users: userId })
      .populate({
        path: 'users',
        select: '-pseudo, -email, -phone, -picture_url',
      })
      .exec();

    return conversations.map((conversation) => {
      return {
        _id: conversation._id,
        name: conversation.name,
        picture_url: conversation.picture_url,
        users: conversation.users,
        last_message: conversation.messages.slice(-1)[0],
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
      };
    });
  }

  async modify(
    userId: ObjectId,
    conversationId: ObjectId,
    updateConversation: UpdateConversationDto,
    fileMulter?: Express.Multer.File,
  ) {
    const conversation = await this.findOne(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (updateConversation.name) {
      conversation.name = updateConversation.name;
    }

    if (
      updateConversation.users &&
      updateConversation.users !== conversation.users.map((user) => user.phone)
    ) {
      const users = (await this.connection
        .model('User')
        .find({ phone: updateConversation.users })
        .exec()) as unknown as User[];
      conversation.users = users.map((user) => user._id);
    }

    if (fileMulter) {
      const picture = await this.saveFileToGridFS(fileMulter);
      conversation.picture = picture;
      conversation.picture_url = `${process.env.CDN_URL}/conversations/${conversation._id}/picture`;
    }
    if (await conversation.save()) {
      return await conversation.populate({
        path: 'users',
        select: '-password -role -picture',
      });
    }
    throw new BadRequestException('Error updating conversation');
  }

  async getPicture(conversationId: ObjectId) {
    const conversation = await this.findOne(conversationId);
    if (!conversation) {
      console.log('Picture not found');
      throw new NotFoundException('Picture not found');
    }
    return this.gridFsBucket.openDownloadStream(conversation.picture);
  }

  findAll() {
    return this.conversationModel.find().populate('users').exec();
  }

  async findOne(id: ObjectId) {
    const conversation = await this.conversationModel
      .findOne({ _id: id })
      .populate({
        path: 'users',
        select: '-password -role -picture',
      })
      .exec();
    return conversation;
  }

  remove(id: ObjectId) {
    const removed = this.conversationModel.deleteOne({ _id: id }).exec();
    if (!removed) {
      throw new NotFoundException('Conversation not found');
    }
    return true;
  }

  async sendMessage(data: SendMessageDto) {
    const conversation = await this.conversationModel
      .findOne({ _id: data.conversation_id })
      .populate('users')
      .exec();
    conversation.updated_at = new Date();
    conversation.messages.push({
      _id: new ObjectId(),
      sender_id: data.sender_id,
      content: data.content,
      created_at: new Date(),
    });
    return conversation.save();
  }

  async leaveConversation(conversationId: ObjectId, userId: ObjectId) {
    const conversation = await this.conversationModel
      .findOne({ _id: conversationId })
      .populate({
        path: 'users',
        select: '-password -role -picture',
      })
      .exec();
    conversation.users = conversation.users.filter(
      (user) => user._id != userId,
    );

    if (conversation.users.length === 1) {
      return this.remove(conversationId);
    }

    if (conversation.owned_by == userId) {
      conversation.owned_by = conversation.users[0]._id;
    }

    if (conversation.save()) {
      return true;
    }
    return false;
  }

  async leaveAllConversations(userId: ObjectId) {
    const conversations = await this.conversationModel
      .find({ users: userId })
      .exec();
    for (const conversation of conversations) {
      await this.leaveConversation(conversation._id, userId);
    }
    return true;
  }

  async deleteMessageFromConversation(
    conversationId: string,
    messageId: string,
  ): Promise<Conversation | null> {
    try {
      const updatedConversation = await this.conversationModel
        .findOneAndUpdate(
          { _id: conversationId },
          { $pull: { messages: { _id: messageId } } },
          { new: true },
        )
        .exec();

      if (!updatedConversation) {
        throw new Error(`Conversation with ID ${conversationId} not found`);
      }

      return updatedConversation;
    } catch (error) {
      console.error('Error deleting message from conversation:', error);
      throw error;
    }
  }
}
