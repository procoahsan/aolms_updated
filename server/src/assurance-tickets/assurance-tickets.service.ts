import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssuranceTicket } from './assurance-tickets.entity';
import { CreateAssuranceTicketDto } from './dto/create-assurance-ticket.dto';
import { UpdateAssuranceTicketDto } from './dto/update-assurance-ticket.dto';

@Injectable()
export class AssuranceTicketsService {
  constructor(
    @InjectRepository(AssuranceTicket)
    private assuranceTicketsRepository: Repository<AssuranceTicket>,
  ) {}

  async create(createAssuranceTicketDto: CreateAssuranceTicketDto): Promise<AssuranceTicket> {
    const ticket = this.assuranceTicketsRepository.create(createAssuranceTicketDto);
    return this.assuranceTicketsRepository.save(ticket);
  }

  async findAll(): Promise<AssuranceTicket[]> {
    return this.assuranceTicketsRepository.find();
  }

  async findAllByTechnicianId(technicianId: string): Promise<AssuranceTicket[]> {
    return this.assuranceTicketsRepository.find({
      where: { technician_id: technicianId },
    });
  }

  async findOne(id: string): Promise<AssuranceTicket> {
    const ticket = await this.assuranceTicketsRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Assurance ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async update(id: string, updateAssuranceTicketDto: UpdateAssuranceTicketDto): Promise<AssuranceTicket> {
    const ticket = await this.assuranceTicketsRepository.preload({
      id: id,
      ...updateAssuranceTicketDto,
    });
    if (!ticket) {
      throw new NotFoundException(`Assurance ticket with ID ${id} not found`);
    }
    return this.assuranceTicketsRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const result = await this.assuranceTicketsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assurance ticket with ID ${id} not found`);
    }
  }
}