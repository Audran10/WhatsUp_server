import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConversationsService } from './conversations.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Server } from 'socket.io';
import { ObjectId } from 'mongodb';

@WebSocketGateway()
export class ConversationsGateway {
  constructor(private readonly conversationsService: ConversationsService) {}

  @WebSocketServer()
  socket: Server;

  @SubscribeMessage('createConversation')
  create(@MessageBody() data: any) {
    console.log(data);
    this.socket.emit('conversation/{id}', data);
    return data;
  }

  @SubscribeMessage('findAllConversations')
  findAll() {
    return this.conversationsService.findAll();
  }

  @SubscribeMessage('findOneConversation')
  findOne(@MessageBody() id: ObjectId) {
    return this.conversationsService.findOne(id);
  }

  @SubscribeMessage('updateConversation')
  update(@MessageBody() updateConversationDto: UpdateConversationDto) {
    return this.conversationsService.update(updateConversationDto.id);
  }

  @SubscribeMessage('removeConversation')
  remove(@MessageBody() id: ObjectId) {
    return this.conversationsService.remove(id);
  }
}
