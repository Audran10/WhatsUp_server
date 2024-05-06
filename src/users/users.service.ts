import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Connection } from 'mongoose';
import { ObjectId, GridFSBucket, GridFSBucketWriteStream } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user-dto';
import 'dotenv/config';
import { ConversationsService } from 'src/conversations/conversations.service';

@Injectable()
export class UsersService {
  private gridFsBucket: GridFSBucket;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel('User') private readonly userModel: Model<User>,
    private conversationsService: ConversationsService,
    private readonly jwtService: JwtService,
  ) {
    this.gridFsBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'User',
    });
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

  async getPicture(userId: string) {
    const user = await this.findOne(userId);
    if (!user) {
      console.log('Picture not found');
      throw new NotFoundException('Picture not found');
    }
    return this.gridFsBucket.openDownloadStream(user.picture);
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.userModel
      .findOne({ phone: createUserDto.phone })
      .select('-password')
      .exec();
    if (user) {
      throw new BadRequestException('User already exists');
    } else {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = await new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      }).save();
      const payload = {
        id: newUser._id,
        pseudo: newUser.pseudo,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          ...newUser.toJSON(),
        },
      };
    }
  }

  async login(userDto: LoginUserDto) {
    let user = await this.userModel.findOne({ email: userDto.email }).exec();
    if (!user) {
      user = await this.userModel.findOne({ phone: userDto.phone }).exec();
    }
    if (!user) {
      throw new UnauthorizedException();
    }

    if (bcrypt.compareSync(userDto.password, user.password) === false) {
      throw new UnauthorizedException();
    }
    const payload = {
      id: user._id,
      pseudo: user.pseudo,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        _id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
        picture_url: user.picture_url,
        role: user.role,
      },
    };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).select('-password').exec();
  }

  async deleteOne(id: ObjectId): Promise<User> {
    if (this.conversationsService.leaveAllConversations(id)) {
      const user = await this.userModel.findOneAndDelete({ _id: id }).exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    }
    throw new BadRequestException('Error deleting user');
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (file) {
      const picture = await this.saveFileToGridFS(file);
      user.picture = picture;
      user.picture_url = `${process.env.CDN_URL}/users/${user._id}/picture`;
      return user.save();
    }

    return user;
  }

  async findOneAndBan(id: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id },
        { $set: { role: 'banned' } },
        { new: true },
      )
      .select('-password -picture -picture_url -__v')
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async findOneAndUnban(id: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id }, { $set: { role: 'user' } }, { new: true })
      .select('-password -picture -picture_url -__v')
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async findOneAndBecomeAdmin(id: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id }, { $set: { role: 'admin' } }, { new: true })
      .select('-password -picture -picture_url -__v')
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
