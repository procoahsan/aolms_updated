import 'server-only';

import { AttachmentsService } from './attachments.service';









export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  
  
  findAll() {
    return this.attachmentsService.findAll();
  }
}