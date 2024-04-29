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
  async acceptTicket(@Param('id') ticketId: string) {
    return this.ticketsService.deleteTicketAndMessage(ticketId);
  }

  @Delete('cancel/:id')
  @UseGuards(AuthGuard)
  cancelTicket(@Param('id') id: string) {
    return this.ticketsService.deleteTicket(id);
  }
}
