import 'server-only';

import { OrderAssignmentsService } from './order-assignments.service';
import { CreateOrderAssignmentDto } from './dto/create-order-assignment.dto';
import { UpdateOrderAssignmentDto } from './dto/update-order-assignment.dto';









export class OrderAssignmentsController {
  constructor(private orderAssignmentsService: OrderAssignmentsService) {}

  
  
  create( createOrderAssignmentDto: CreateOrderAssignmentDto) {
    return this.orderAssignmentsService.create(createOrderAssignmentDto);
  }

  
  
  findAll( req: any) {
    // For technicians, filter by their ID
    const user = req.user;
    if (user.role === 'technician') {
      return this.orderAssignmentsService.findByTechnicianId(user.userId);
    }
    return this.orderAssignmentsService.findAll();
  }

  
  
  findOne( id: string) {
    return this.orderAssignmentsService.findOne(id);
  }

  
  
  update( id: string,  updateOrderAssignmentDto: UpdateOrderAssignmentDto) {
    return this.orderAssignmentsService.update(id, updateOrderAssignmentDto);
  }

  
  
  remove( id: string) {
    return this.orderAssignmentsService.remove(id);
  }
}