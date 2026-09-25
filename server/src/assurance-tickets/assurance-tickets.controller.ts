import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AssuranceTicketsService } from './assurance-tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('assurance-tickets')
export class AssuranceTicketsController {
  constructor(private readonly service: AssuranceTicketsService) {}
  @Get('metadata') @Roles(Role.Admin, Role.Controller)
  metadata(@Request() req: any) { return this.service.metadata(req.user); }
  @Post('batch') @Roles(Role.Admin, Role.Controller)
  save(@Body() body: unknown, @Request() req: any) { return this.service.saveRows(body, req.user); }
  @Get() @Roles(Role.Admin, Role.Controller, Role.Technician)
  list(@Request() req: any, @Query('project_id') projectId?: string) { return this.service.findAll(req.user, projectId); }
  @Get(':id') @Roles(Role.Admin, Role.Controller, Role.Technician)
  one(@Param('id') id: string, @Request() req: any) { return this.service.findOne(id, req.user); }
}
