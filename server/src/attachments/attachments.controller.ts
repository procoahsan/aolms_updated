import { Controller, Get, UseGuards } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Get()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findAll() {
    return this.attachmentsService.findAll();
  }
}