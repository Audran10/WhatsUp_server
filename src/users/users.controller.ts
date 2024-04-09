import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto as CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto as LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from 'src/guard.service';

@Controller('users')
// @ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
//   @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('/')
//   @ApiBearerAuth()
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
}
