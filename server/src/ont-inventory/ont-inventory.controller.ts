import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { OntInventoryService } from './ont-inventory.service';
import { CreateOntInventoryDto } from './dto/create-ont-inventory.dto';
import { UpdateOntInventoryDto } from './dto/update-ont-inventory.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('ont-inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ont-inventory')
export class OntInventoryController {
  constructor(private ontInventoryService: OntInventoryService) {}

  @Post()
  @Roles(Role.Admin, Role.Controller)
  create(@Body() createOntInventoryDto: CreateOntInventoryDto) {
    return this.ontInventoryService.create(createOntInventoryDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findAll(@Query('model') model?: string, @Query('status') status?: string) {
    return this.ontInventoryService.findAll({ model, status });
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findOne(@Param('id') id: string) {
    return this.ontInventoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Controller)
  update(@Param('id') id: string, @Body() updateOntInventoryDto: UpdateOntInventoryDto) {
    return this.ontInventoryService.update(id, updateOntInventoryDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.ontInventoryService.remove(id);
  }
}