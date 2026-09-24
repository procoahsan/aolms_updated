import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrderAssignmentsService } from './order-assignments.service';
import { CreateOrderAssignmentDto } from './dto/create-order-assignment.dto';
import { UpdateOrderAssignmentDto } from './dto/update-order-assignment.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('order-assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('order-assignments')
export class OrderAssignmentsController {
  constructor(private orderAssignmentsService: OrderAssignmentsService) {}

  @Post()
  @Roles(Role.Admin, Role.Controller)
  create(@Body() createOrderAssignmentDto: CreateOrderAssignmentDto) {
    return this.orderAssignmentsService.create(createOrderAssignmentDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findAll(@Request() req: any) {
    // For technicians, filter by their ID
    const user = req.user;
    if (user.role === 'technician') {
      return this.orderAssignmentsService.findByTechnicianId(user.userId);
    }
    return this.orderAssignmentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findOne(@Param('id') id: string) {
    return this.orderAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Controller)
  update(@Param('id') id: string, @Body() updateOrderAssignmentDto: UpdateOrderAssignmentDto) {
    return this.orderAssignmentsService.update(id, updateOrderAssignmentDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.orderAssignmentsService.remove(id);
  }
}