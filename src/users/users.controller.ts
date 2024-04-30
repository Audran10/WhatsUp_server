import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto as CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto as LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from 'src/guard.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Post('register/')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('login/')
  login(@Body() loginDto: LoginUserDto) {
    return this.usersService.login(loginDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateUser(id, updateUserDto, file);
  }

  @Get(':id/picture')
  async streamUserPicture(@Res() res: Response, @Req() req) {
    const stream = await this.usersService.getPicture(req.params.id);
    res.set('Content-Type', 'image/jpeg');
    stream.pipe(res);
  }

  @Put('ban/:id')
  @UseGuards(AuthGuard)
  banUser(@Param('id') id: string) {
    return this.usersService.findOneAndBan(id);
  }

  @Put('unban/:id')
  @UseGuards(AuthGuard)
  unbanUser(@Param('id') id: string) {
    return this.usersService.findOneAndUnban(id);
  }

  @Put('admin/:id')
  @UseGuards(AuthGuard)
  becomeAdmin(@Param('id') id: string) {
    return this.usersService.findOneAndBecomeAdmin(id);
  }
}
