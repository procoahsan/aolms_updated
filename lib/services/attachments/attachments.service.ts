import 'server-only';


import {Repository} from '@/lib/repository';
import { Attachment } from './attachments.entity';


export class AttachmentsService {
  constructor(
    
    private attachmentsRepository: Repository<Attachment>,
  ) {}

  async findAll(): Promise<Attachment[]> {
    return this.attachmentsRepository.find();
  }
}