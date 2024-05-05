import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from 'src/guard.service';
import { ObjectId } from 'mongoose';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Req() req, @Body() message: { message_id: ObjectId }) {
    return this.ticketsService.create(req.user.id, message.message_id);
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
