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
  Param,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AuthGuard } from 'src/guard.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createConversation(createConversationDto);
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
    return this.conversationsService.sendMessage(
      req.params.id,
      req.user.id,
      message.content,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Req() req) {
    return this.conversationsService.remove(req.params.id);
  }

  @Delete(':conversationId/message/:messageId')
  async deleteMessage(
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.conversationsService.deleteMessageFromConversation(
      conversationId,
      messageId,
    );
  }
}
