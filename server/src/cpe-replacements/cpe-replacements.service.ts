import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CpeReplacement } from './cpe-replacements.entity';

@Injectable()
export class CpeReplacementsService {
  constructor(
    @InjectRepository(CpeReplacement)
    private cpeReplacementsRepository: Repository<CpeReplacement>,
  ) {}

  async findAll(): Promise<CpeReplacement[]> {
    return this.cpeReplacementsRepository.find();
  }
}