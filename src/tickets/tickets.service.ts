import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
// import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Ticket } from './entities/ticket.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel('Ticket') private readonly ticketModel: Model<Ticket>,
    @InjectModel('Conversation')
    private readonly conversationModel: Model<Conversation>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    try {
      const ticket = await this.ticketModel.create(createTicketDto);
      return ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error('Unable to create ticket');
    }
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketModel.find().exec();
  }

  async findOne(id: string): Promise<Ticket> {
    return this.ticketModel.findOne({ _id: id }).exec();
  }

  async deleteTicketAndMessage(
    ticketId: string,
    conversationId: string,
    messageId: string,
  ): Promise<{ ticket: Ticket | null; messageDeleted: boolean }> {
    try {
      const ticket = await this.ticketModel
        .findOneAndDelete({ _id: ticketId })
        .exec();
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      const updatedConversation = await this.conversationModel
        .findOneAndUpdate(
          { _id: conversationId },
          { $pull: { messages: { _id: messageId } } },
          { new: true },
        )
        .exec();

      if (!updatedConversation) {
        throw new Error(`Conversation with ID ${conversationId} not found`);
      }

      const messageDeleted = updatedConversation.messages.every(
        (msg) => msg._id.toString() !== messageId,
      );

      return { ticket, messageDeleted };
    } catch (error) {
      console.error('Error deleting ticket and message:', error);
      throw error;
    }
  }

  async deleteTicket(id: string): Promise<Ticket | null> {
    try {
      const ticket = await this.ticketModel
        .findOneAndDelete({ _id: id })
        .exec();
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
