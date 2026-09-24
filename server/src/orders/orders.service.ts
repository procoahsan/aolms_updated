import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Profile } from '../profiles/profiles.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { OrderAssignment } from '../order-assignments/order-assignments.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(OrderAssignment)
    private orderAssignmentsRepository: Repository<OrderAssignment>,
    private profilesService: ProfilesService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(createOrderDto);
    return this.ordersRepository.save(order);
  }

  async findAll(filters: { project_id?: string; technician_id?: string; work_date?: string }): Promise<Order[]> {
    const queryBuilder = this.ordersRepository.createQueryBuilder('order');

    if (filters.project_id) {
      queryBuilder.andWhere('order.project_id = :project_id', { project_id: filters.project_id });
    }
    if (filters.work_date) {
      queryBuilder.andWhere('order.work_date = :work_date', { work_date: filters.work_date });
    }

    if (filters.technician_id) {
      const technician = await this.profilesRepository.findOne({
        where: { id: filters.technician_id, role: 'technician' },
      });
      if (!technician) {
        throw new ForbiddenException('Invalid technician ID');
      }

      queryBuilder
        .andWhere('order.technician_id = :technician_id', { technician_id: filters.technician_id })
        .andWhere('order.action = :action', { action: 'Delivered' });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.preload({
      id: id,
      ...updateOrderDto,
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ordersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}