import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ConversationsGateway {
  constructor(private readonly conversationsService: ConversationsService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createConversation')
  create(@MessageBody() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createDiscussion(createConversationDto);
  }

  @SubscribeMessage('createMessage')
  createMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    return this.conversationsService.createMessage(createMessageDto);
  }

  @SubscribeMessage('findAllConversations')
  findAll() {
    return this.conversationsService.findAll();
  }

  @SubscribeMessage('findOneConversation')
  findOne(@MessageBody() id: number) {
    return this.conversationsService.findOne(id);
  }

  @SubscribeMessage('updateConversation')
  update(@MessageBody() updateConversationDto: UpdateConversationDto) {
    return this.conversationsService.update(updateConversationDto.id, updateConversationDto);
  }

  @SubscribeMessage('removeConversation')
  remove(@MessageBody() id: number) {
    return this.conversationsService.remove(id);
  }
}
