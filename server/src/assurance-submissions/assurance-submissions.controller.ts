import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AssuranceSubmissionsService } from './assurance-submissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('assurance-submissions')
export class AssuranceSubmissionsController {
  constructor(private readonly service: AssuranceSubmissionsService) {}
  @Get('audit') @Roles(Role.Technician)
  audit(@Request() req:any) { return this.service.audit(req.user); }
  @Get(':ticketId') @Roles(Role.Admin,Role.Controller,Role.Technician)
  get(@Param('ticketId') id:string,@Request() req:any,@Query('technician_id') owner?:string) { return this.service.get(id,req.user,owner); }
  @Post(':ticketId/save') @Roles(Role.Admin,Role.Controller,Role.Technician)
  save(@Param('ticketId') id:string,@Body() body:unknown,@Request() req:any) { return this.service.save(id,body,req.user); }
}
