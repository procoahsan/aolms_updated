import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CpeInventory } from './cpe-inventory.entity';
import { CreateCpeInventoryDto } from './dto/create-cpe-inventory.dto';
import { UpdateCpeInventoryDto } from './dto/update-cpe-inventory.dto';

@Injectable()
export class CpeInventoryService {
  constructor(
    @InjectRepository(CpeInventory)
    private cpeInventoryRepository: Repository<CpeInventory>,
  ) {}

  async create(createCpeInventoryDto: CreateCpeInventoryDto): Promise<CpeInventory> {
    const item = this.cpeInventoryRepository.create(createCpeInventoryDto);
    return this.cpeInventoryRepository.save(item);
  }

  async findAll(filters: { project_id?: string; serial_number?: string }): Promise<CpeInventory[]> {
    const queryBuilder = this.cpeInventoryRepository.createQueryBuilder('cpe');

    if (filters.project_id) {
      queryBuilder.andWhere('cpe.project_id = :project_id', { project_id: filters.project_id });
    }
    if (filters.serial_number) {
      queryBuilder.andWhere('cpe.serial_number = :serial_number', { serial_number: filters.serial_number });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<CpeInventory> {
    const item = await this.cpeInventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`CPE inventory item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateCpeInventoryDto: UpdateCpeInventoryDto): Promise<CpeInventory> {
    const item = await this.cpeInventoryRepository.preload({
      id: id,
      ...updateCpeInventoryDto,
    });
    if (!item) {
      throw new NotFoundException(`CPE inventory item with ID ${id} not found`);
    }
    return this.cpeInventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const result = await this.cpeInventoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`CPE inventory item with ID ${id} not found`);
    }
  }
}