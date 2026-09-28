import 'server-only';

import { AuditLogsService } from './audit-logs.service';









export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  
  
  findAll() {
    return this.auditLogsService.findAll();
  }
}