import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, ObjectId } from 'mongoose';
import { Ticket } from './entities/ticket.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class TicketsService {
  constructor(
    @InjectModel('Ticket') private readonly TicketModel: Model<Ticket>,
    @InjectModel('Conversation')
    private readonly ConversationModel: Model<Conversation>,
    @InjectModel('User') private readonly UserModel: Model<User>,

    private readonly jwtService: JwtService,
  ) {}

  async findConversationFromMessageId(
    messageId: ObjectId,
  ): Promise<Conversation | null> {
    const conversation = await this.ConversationModel.findOne({
      messages: { $elemMatch: { _id: messageId } },
    }).exec();
    return conversation;
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const user = await this.UserModel.findOne({
      _id: createTicketDto.reporter,
    }).exec();

    if (!user) {
      throw new Error(`User with ID ${createTicketDto.reporter} not found`);
    }

    const conversation = await this.findConversationFromMessageId(
      createTicketDto.message_id,
    );

    if (!conversation) {
      throw new Error(
        `Conversation not found for message ID ${createTicketDto.message_id}`,
      );
    }

    createTicketDto.reporter = user.pseudo;
    createTicketDto.conversation_id = conversation._id;

    const ticket = await this.TicketModel.create(createTicketDto);
    return ticket;
  }

  async findAll(): Promise<Ticket[]> {
    return this.TicketModel.find().exec();
  }

  async findOne(id: string): Promise<Ticket> {
    return this.TicketModel.findOne({ _id: id }).exec();
  }

  async deleteTicketAndMessage(ticketId: string): Promise<Ticket | null> {
    try {
      const ticket = await this.TicketModel.findOneAndDelete({
        _id: ticketId,
      }).exec();
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      const updatedConversation = await this.ConversationModel.findOneAndUpdate(
        { _id: ticket?.conversation_id },
        { $pull: { messages: { _id: ticket.message_id } } },
        { new: true },
      ).exec();

      if (!updatedConversation) {
        throw new Error(
          `Conversation with ID ${ticket.conversation_id} not found`,
        );
      }

      return ticket;
    } catch (error) {
      console.error('Error deleting ticket and message:', error);
      throw error;
    }
  }

  async deleteTicket(id: string): Promise<Ticket | null> {
    try {
      const ticket = await this.TicketModel.findOneAndDelete({
        _id: id,
      }).exec();
      if (!ticket) {
        throw new Error(`Ticket with ID ${id} not found`);
      }
      return ticket;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }
}
