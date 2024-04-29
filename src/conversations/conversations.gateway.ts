import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';

import { ConversationsService } from './conversations.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Server, Socket } from 'socket.io';

import { ObjectId } from 'mongodb';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ cors: true })
export class ConversationsGateway {
  constructor(private readonly conversationsService: ConversationsService) {}

  @WebSocketServer()
  socket: Server;

  @SubscribeMessage('joinNotification')
  joinNotification(
    @MessageBody() user_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`notification/${user_id}`);
  }

  @SubscribeMessage('joinConversation')
  joinConversation(
    @MessageBody() id: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation/${id}`);
  }

  @SubscribeMessage('send_message')
  async sendMessage(@MessageBody() data: string) {
    const sendMessageDto: SendMessageDto = JSON.parse(data);
    const conversation =
      await this.conversationsService.sendMessage(sendMessageDto);
    const message = conversation.messages.slice(-1)[0];
    this.socket
      .to(`conversation/${sendMessageDto.conversation_id}`)
      .emit('new_message', JSON.stringify(message));
    const conv = {
      _id: conversation._id,
      name: conversation.name,
      picture_url: conversation.picture_url,
      users: conversation.users,
      last_message: message,
      created_at: message.created_at,
      updated_at: conversation.updated_at,
    };
    conversation.users.forEach((user) => {
      this.socket
        .to(`notification/${user._id}`)
        .emit('new_message', JSON.stringify(conv));
    });
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
