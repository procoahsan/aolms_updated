import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServiceDeliveryService } from './service-delivery.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';

@Controller('service-delivery')
@UseGuards(JwtAuthGuard)
@Roles(Role.Admin, Role.Controller)
export class ServiceDeliveryController {
  constructor(private readonly service: ServiceDeliveryService) {}

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Upload Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Post('upload-wbs')
  @UseInterceptors(FileInterceptor('file'))
  uploadWbs(
    @UploadedFile() file: Express.Multer.File,
    @Query('date') targetDate?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    try {
      const result = this.service.uploadWbs(file.buffer, targetDate);
      return {
        success: true,
        message: `WBS sheet processed â€” ${result.totalDelivered} delivered orders found`,
        data: result,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to process WBS file: ${error.message}`);
    }
  }

  @Post('upload-response')
  @UseInterceptors(FileInterceptor('file'))
  uploadResponse(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    try {
      const result = this.service.uploadResponse(file.buffer);
      return {
        success: true,
        message: `Response sheet processed â€” ${result.totalRecords} records found`,
        data: result,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to process Response file: ${error.message}`);
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Date Change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Post('change-date')
  changeDate(@Body('selectedDate') selectedDate: string) {
    if (!selectedDate) throw new BadRequestException('selectedDate is required');
    try {
      const result = this.service.changeDate(selectedDate);
      return {
        success: true,
        message: `Re-filtered for date ${selectedDate} â€” ${result.totalDelivered} delivered orders`,
        data: result,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to change date: ${error.message}`);
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Tab 1: Data Verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Post('data-verification')
  dataVerification() {
    try {
      const result = this.service.dataVerification();
      return {
        success: true,
        message: `Data verification: ${result.foundCount} found, ${result.notFoundCount} not found`,
        data: result,
      };
    } catch (error: any) {
      throw new BadRequestException(`Data verification failed: ${error.message}`);
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Tab 2: Cross Verification & ONT Check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Post('cross-verify-ont')
  crossVerifyOnt() {
    try {
      const result = this.service.crossVerifyOntCheck();
      return {
        success: true,
        message: `Cross verification & ONT check: ${result.foundInOnt} found in ONT, ${result.needsInvestigation} need investigation`,
        data: result,
      };
    } catch (error: any) {
      throw new BadRequestException(`Cross verification & ONT check failed: ${error.message}`);
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Tab 3: Final Output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Post('final-output')
  finalOutput() {
    try {
      const result = this.service.finalOutput();
      return {
        success: true,
        message: `Final Output generated: ${result.totalRecords} records`,
        data: result,
      };
    } catch (error: any) {
      throw new BadRequestException(`Final Output generation failed: ${error.message}`);
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  @Get('status')
  getStatus() {
    return {
      success: true,
      data: this.service.getStatus(),
    };
  }
}
