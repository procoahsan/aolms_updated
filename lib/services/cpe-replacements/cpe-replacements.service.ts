import 'server-only';


import {Repository} from '@/lib/repository';
import { CpeReplacement } from './cpe-replacements.entity';


export class CpeReplacementsService {
  constructor(
    
    private cpeReplacementsRepository: Repository<CpeReplacement>,
  ) {}

  async findAll(): Promise<CpeReplacement[]> {
    return this.cpeReplacementsRepository.find();
  }
}