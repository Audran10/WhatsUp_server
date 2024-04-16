import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AuthGuard } from 'src/guard.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createConversation(createConversationDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findMyConversations(@Req() req) {
    return this.conversationsService.findMyConversations(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Req() req) {
    return this.conversationsService.findOne(req.params.id);
  }
}
