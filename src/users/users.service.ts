import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (user) {
      throw new BadRequestException('Email already exists');
    } else {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = await new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      }).save();

      return {
        ...newUser.toJSON(),
        password: undefined,
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
      sub: user._id,
      pseudo: user.pseudo,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        _id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture,
        role: user.role,
      },
    };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).exec();
  }
}
