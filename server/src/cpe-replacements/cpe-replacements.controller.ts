import { Controller, Get, UseGuards } from '@nestjs/common';
import { CpeReplacementsService } from './cpe-replacements.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('cpe-replacements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cpe-replacements')
export class CpeReplacementsController {
  constructor(private cpeReplacementsService: CpeReplacementsService) {}

  @Get()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findAll() {
    return this.cpeReplacementsService.findAll();
  }
}