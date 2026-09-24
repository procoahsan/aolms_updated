import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CpeInventoryService } from './cpe-inventory.service';
import { CreateCpeInventoryDto } from './dto/create-cpe-inventory.dto';
import { UpdateCpeInventoryDto } from './dto/update-cpe-inventory.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('cpe-inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cpe-inventory')
export class CpeInventoryController {
  constructor(private cpeInventoryService: CpeInventoryService) {}

  @Post()
  @Roles(Role.Admin, Role.Controller)
  create(@Body() createCpeInventoryDto: CreateCpeInventoryDto) {
    return this.cpeInventoryService.create(createCpeInventoryDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findAll(@Query('project_id') project_id?: string, @Query('serial_number') serial_number?: string) {
    return this.cpeInventoryService.findAll({ project_id, serial_number });
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findOne(@Param('id') id: string) {
    return this.cpeInventoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Controller)
  update(@Param('id') id: string, @Body() updateCpeInventoryDto: UpdateCpeInventoryDto) {
    return this.cpeInventoryService.update(id, updateCpeInventoryDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.cpeInventoryService.remove(id);
  }
}