import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ObjectId, GridFSBucket, GridFSBucketWriteStream } from 'mongodb';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';

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
    } as { name: string; users: ObjectId[] };

    const newConversation = await new this.conversationModel(
      conversation,
    ).save();
    if (file) {
      const picture = await this.saveFileToGridFS(file);
      newConversation.picture = picture;
      newConversation.picture_url = `http://localhost:3000/conversations/${newConversation._id}/picture`;
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
      .populate('users')
      .exec();

    return conversations.map((conversation) => {
      return {
        _id: conversation._id,
        name: conversation.name,
        picture_url: conversation.picture_url,
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
    conversation.picture_url = `http://localhost:3000/conversations/${conversation._id}/picture`;
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
    const conversation = this.conversationModel
    .findOne({ _id: id })
    .populate('users')
    .exec();

    return conversation.then((conversation) => {
      return {
        _id: conversation._id,
        name: conversation.name,
        picture: conversation.picture,
        picture_url: conversation.picture_url,
        users: conversation.users.map((user) => {
          return {
            ...user.toJSON(),
            password: undefined,
            role: undefined,
          };
        }),
        messages: conversation.messages,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
      };
    });
  }

  update(id: number) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: ObjectId) {
    console.log('Removing conversation', id);
    return this.conversationModel.deleteOne({ _id: id }).exec();
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
    console.log(conversation);
    return conversation.save();
  }
}
