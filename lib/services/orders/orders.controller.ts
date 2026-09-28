import 'server-only';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';









export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  
  
  create( createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  
  
  findAll( project_id?: string,  technician_id?: string,  work_date?: string) {
    return this.ordersService.findAll({ project_id, technician_id, work_date });
  }

  
  
  findOne( id: string) {
    return this.ordersService.findOne(id);
  }

  
  
  update( id: string,  updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  
  
  remove( id: string) {
    return this.ordersService.remove(id);
  }
}