import 'server-only';
import {NotFoundException} from '@/lib/http';

import {Repository} from '@/lib/repository';
import { OrderAssignment } from './order-assignments.entity';
import { CreateOrderAssignmentDto } from './dto/create-order-assignment.dto';
import { UpdateOrderAssignmentDto } from './dto/update-order-assignment.dto';


export class OrderAssignmentsService {
  constructor(
    
    private orderAssignmentsRepository: Repository<OrderAssignment>,
  ) {}

  async create(createOrderAssignmentDto: CreateOrderAssignmentDto): Promise<OrderAssignment> {
    const assignment = this.orderAssignmentsRepository.create(createOrderAssignmentDto);
    return this.orderAssignmentsRepository.save(assignment);
  }

  async findAll(): Promise<OrderAssignment[]> {
    return this.orderAssignmentsRepository.find();
  }

  async findByTechnicianId(technicianId: string): Promise<OrderAssignment[]> {
    return this.orderAssignmentsRepository.find({
      where: { technician_id: technicianId },
    });
  }

  async findOne(id: string): Promise<OrderAssignment> {
    const assignment = await this.orderAssignmentsRepository.findOne({ where: { id } });
    if (!assignment) {
      throw new NotFoundException(`Order assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async update(id: string, updateOrderAssignmentDto: UpdateOrderAssignmentDto): Promise<OrderAssignment> {
    const assignment = await this.orderAssignmentsRepository.preload({
      id: id,
      ...updateOrderAssignmentDto,
    });
    if (!assignment) {
      throw new NotFoundException(`Order assignment with ID ${id} not found`);
    }
    return this.orderAssignmentsRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderAssignmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order assignment with ID ${id} not found`);
    }
  }
}