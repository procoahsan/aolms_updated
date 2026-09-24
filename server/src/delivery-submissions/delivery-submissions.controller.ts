import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DeliverySubmissionsService } from './delivery-submissions.service';
import { CreateDeliverySubmissionDto } from './dto/create-delivery-submission.dto';
import { UpdateDeliverySubmissionDto } from './dto/update-delivery-submission.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@ApiTags('delivery-submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-submissions')
export class DeliverySubmissionsController {
  constructor(private deliverySubmissionsService: DeliverySubmissionsService) {}

  @Post()
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  create(@Body() createDeliverySubmissionDto: CreateDeliverySubmissionDto) {
    return this.deliverySubmissionsService.create(createDeliverySubmissionDto);
  }

  @Get(':orderId')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  findOneByOrderId(@Param('orderId') orderId: string) {
    return this.deliverySubmissionsService.findOneByOrderId(orderId);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  update(@Param('id') id: string, @Body() updateDeliverySubmissionDto: UpdateDeliverySubmissionDto) {
    return this.deliverySubmissionsService.update(id, updateDeliverySubmissionDto);
  }

  @Post(':id/submit')
  @Roles(Role.Admin, Role.Controller, Role.Technician)
  submit(@Param('id') id: string) {
    return this.deliverySubmissionsService.submit(id);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.deliverySubmissionsService.remove(id);
  }
}