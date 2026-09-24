import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AssuranceSubmissionsService } from './assurance-submissions.service';
import { CreateAssuranceSubmissionDto } from './dto/create-assurance-submission.dto';
import { UpdateAssuranceSubmissionDto } from './dto/update-assurance-submission.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('assurance-submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assurance-submissions')
export class AssuranceSubmissionsController {
  constructor(private assuranceSubmissionsService: AssuranceSubmissionsService) {}

  @Post()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  create(@Body() createAssuranceSubmissionDto: CreateAssuranceSubmissionDto) {
    return this.assuranceSubmissionsService.create(createAssuranceSubmissionDto);
  }

  @Get(':ticketId')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findOneByTicketId(@Param('ticketId') ticketId: string) {
    return this.assuranceSubmissionsService.findOneByTicketId(ticketId);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  update(@Param('id') id: string, @Body() updateAssuranceSubmissionDto: UpdateAssuranceSubmissionDto) {
    return this.assuranceSubmissionsService.update(id, updateAssuranceSubmissionDto);
  }

  @Post(':id/submit')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  submit(@Param('id') id: string) {
    return this.assuranceSubmissionsService.submit(id);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.assuranceSubmissionsService.remove(id);
  }
}