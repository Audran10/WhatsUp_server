import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ObjectId, GridFSBucket, GridFSBucketWriteStream } from 'mongodb';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/users/entities/user.entity';

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

  async createConversation(createConversationDto: CreateConversationDto) {
    if (createConversationDto.name === undefined) {
      const users = (await this.connection
        .model('User')
        .find({ _id: createConversationDto.users })
        .exec()) as unknown as User[];
      createConversationDto.name = users.map((user) => user.pseudo).join(', ');
    }
    const newConversation = new this.conversationModel(createConversationDto);
    return newConversation.save();
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
      .populate('users')
      .exec();

    return conversations.map((conversation) => {
      return {
        _id: conversation._id,
        name: conversation.name,
        group_picture: conversation.picture_url,
        users: conversation.users.map((user) => {
          return {
            ...user.toJSON(),
            password: undefined,
            role: undefined,
          };
        }),
        last_message: conversation.messages.slice(-1)[0],
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
      };
    });
  }

  async modifyPicture(
    conversationId: ObjectId,
    fileMulter: Express.Multer.File,
  ) {
    const file = await this.saveFileToGridFS(fileMulter);

    const conversation = await this.conversationModel
      .findOne({ _id: conversationId })
      .exec();
    conversation.picture = file;
    conversation.picture_url = `http://localhost:3000/conversations/${conversationId}/picture`;
    return conversation.save();
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
    return `This action returns all conversations`;
  }

  findOne(id: ObjectId) {
    return this.conversationModel.findOne({ _id: id }).exec();
  }

  update(id: number) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: ObjectId) {
    console.log('Removing conversation', id);
    return this.conversationModel.deleteOne({ _id: id }).exec();
  }

  async sendMessage(
    conversationId: ObjectId,
    senderId: ObjectId,
    content: string,
  ) {
    const conversation = await this.conversationModel
      .findOne({ _id: conversationId })
      .exec();
    conversation.messages.push({
      sender_id: senderId,
      content,
      created_at: new Date(),
    });
    return conversation.save();
  }
}
