import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
  Delete,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AuthGuard } from 'src/guard.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.conversationsService.createConversation(
      createConversationDto,
      req.user.id,
      file,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  async findMyConversations(@Req() req) {
    const conversations = await this.conversationsService.findMyConversations(
      req.user.id,
    );
    return conversations;
  }

  @Post(':id/modifypicture')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  modifyPicture(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.conversationsService.modifyPicture(req.params.id, file);
  }

  @Get(':id/picture')
  async streamMusic(@Res() res: Response, @Req() req) {
    const stream = await this.conversationsService.getPicture(req.params.id);
    res.set('Content-Type', 'image/jpeg');
    stream.pipe(res);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Req() req) {
    return this.conversationsService.findOne(req.params.id);
  }

  @Post(':id/sendMessage')
  @UseGuards(AuthGuard)
  async sendMessage(@Req() req, @Body() message: { content: string }) {
    const sendMessageDto: SendMessageDto = {
      conversation_id: req.params.id,
      content: message.content,
      sender_id: req.user.id,
    };
    return this.conversationsService.sendMessage(sendMessageDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Req() req) {
    return this.conversationsService.remove(req.params.id);
  }
}
