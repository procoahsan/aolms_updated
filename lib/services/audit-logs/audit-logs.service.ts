import 'server-only';


import {Repository} from '@/lib/repository';
import { AuditLog } from './audit-logs.entity';


export class AuditLogsService {
  constructor(
    
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogsRepository.find();
  }
}