import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AssuranceTicketsService } from './assurance-tickets.service';
import { CreateAssuranceTicketDto } from './dto/create-assurance-ticket.dto';
import { UpdateAssuranceTicketDto } from './dto/update-assurance-ticket.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('assurance-tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assurance-tickets')
export class AssuranceTicketsController {
  constructor(private assuranceTicketsService: AssuranceTicketsService) {}

  @Post()
  @Roles(Role.Admin, Role.Controller)
  create(@Body() createAssuranceTicketDto: CreateAssuranceTicketDto) {
    return this.assuranceTicketsService.create(createAssuranceTicketDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findAll(@Request() req: any) {
    const user = req.user;
    if (user.role === 'technician') {
      return this.assuranceTicketsService.findAllByTechnicianId(user.userId);
    }
    return this.assuranceTicketsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findOne(@Param('id') id: string) {
    return this.assuranceTicketsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Controller)
  update(@Param('id') id: string, @Body() updateAssuranceTicketDto: UpdateAssuranceTicketDto) {
    return this.assuranceTicketsService.update(id, updateAssuranceTicketDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.assuranceTicketsService.remove(id);
  }
}