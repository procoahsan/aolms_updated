import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OntInventory } from './ont-inventory.entity';
import { CreateOntInventoryDto } from './dto/create-ont-inventory.dto';
import { UpdateOntInventoryDto } from './dto/update-ont-inventory.dto';

@Injectable()
export class OntInventoryService {
  constructor(
    @InjectRepository(OntInventory)
    private ontInventoryRepository: Repository<OntInventory>,
  ) {}

  async create(createOntInventoryDto: CreateOntInventoryDto): Promise<OntInventory> {
    const item = this.ontInventoryRepository.create(createOntInventoryDto);
    return this.ontInventoryRepository.save(item);
  }

  async findAll(filters: { model?: string; status?: string }): Promise<OntInventory[]> {
    const queryBuilder = this.ontInventoryRepository.createQueryBuilder('ont');

    if (filters.model) {
      queryBuilder.andWhere('ont.model = :model', { model: filters.model });
    }
    if (filters.status) {
      queryBuilder.andWhere('ont.status = :status', { status: filters.status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<OntInventory> {
    const item = await this.ontInventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`ONT inventory item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateOntInventoryDto: UpdateOntInventoryDto): Promise<OntInventory> {
    const item = await this.ontInventoryRepository.preload({
      id: id,
      ...updateOntInventoryDto,
    });
    if (!item) {
      throw new NotFoundException(`ONT inventory item with ID ${id} not found`);
    }
    return this.ontInventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ontInventoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ONT inventory item with ID ${id} not found`);
    }
  }
}