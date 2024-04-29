import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from 'src/guard.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Delete('accept/:id')
  @UseGuards(AuthGuard)
  async acceptTicket(
    @Param('id') ticketId: string,
    @Body() body: { messageId: string; conversationId: string },
  ) {
    const { messageId, conversationId } = body;
    if (!messageId || !conversationId) {
      throw new Error('Message ID and Conversation ID are required');
    }

    return this.ticketsService.deleteTicketAndMessage(
      ticketId,
      messageId,
      conversationId,
    );
  }

  @Delete('cancel/:id')
  @UseGuards(AuthGuard)
  cancelTicket(@Param('id') id: string) {
    return this.ticketsService.deleteTicket(id);
  }
}
