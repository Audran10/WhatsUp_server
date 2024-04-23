import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ConversationsService } from './conversations.service';
import { Server, Socket } from 'socket.io';
import { ObjectId } from 'mongodb';
import { SendMessageDto } from './dto/send-message.dto';
import { Conversation } from './entities/conversation.entity';

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
    this.socket.to(`conversation/${sendMessageDto.conversation_id}`).emit('new_message', JSON.stringify(message));
    conversation.users.forEach((user) => {
      const conv = {
        _id: conversation._id,
        name: conversation.name,
        picture_url: conversation.picture_url,
        users: conversation.users,
        last_message: message,
        created_at: message.created_at,
        sender_id: message.sender_id,
      };
      this.socket.to(`notification/${user}`).emit('new_message', conv);
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
  update() {
    // return this.conversationsService.update(updateConversationDto.id, updateConversationDto);
  }

  @SubscribeMessage('removeConversation')
  remove(@MessageBody() id: ObjectId) {
    return this.conversationsService.remove(id);
  }
}
