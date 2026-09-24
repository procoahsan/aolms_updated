import { Controller, Post, Body, Query, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
@Roles(Role.Admin, Role.Controller)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const result = this.logisticsService.processExcelBuffer(file.buffer);
      console.log(`[Logistics Upload] Records: ${result.records.length}, Dates: ${result.allDates.length} (${result.allDates.join(', ')}), Selected: ${result.selectedDate}`);
      return {
        success: true,
        message: `Logistics file processed successfully â€” ${result.records.length} records found`,
        data: result.records,
        allDates: result.allDates,
        selectedDate: result.selectedDate,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to process excel file: ${error.message}`);
    }
  }

  @Post('upload-team')
  @UseInterceptors(FileInterceptor('file'))
  uploadTeamFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('selectedDate') selectedDate?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const result = this.logisticsService.compareWithTeamBuffer(file.buffer, selectedDate);
      const matchCount = result.data.filter((r) => r.isMatch).length;
      const mismatchCount = result.data.filter((r) => !r.isMatch).length;
      return {
        success: true,
        message: `Team sheet compared. ${matchCount} found, ${mismatchCount} not found in team sheet.`,
        data: result.data,
        availableDates: result.availableDates,
        selectedDate: result.selectedDate,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to compare team sheet: ${error.message}`);
    }
  }

  @Post('change-date')
  changeDate(@Body('selectedDate') selectedDate: string) {
    if (!selectedDate) {
      throw new BadRequestException('selectedDate is required');
    }
    try {
      const result = this.logisticsService.changeDate(selectedDate);

      // Check if it's a team comparison result or plain parse result
      if ('availableDates' in result) {
        const teamResult = result;
        const matchCount = teamResult.data.filter((r) => r.isMatch).length;
        const mismatchCount = teamResult.data.filter((r) => !r.isMatch).length;
        return {
          success: true,
          message: `Re-filtered. ${matchCount} found, ${mismatchCount} not found.`,
          data: teamResult.data,
          availableDates: teamResult.availableDates,
          selectedDate: teamResult.selectedDate,
        };
      } else {
        return {
          success: true,
          message: 'Data re-filtered for selected date.',
          data: result.records,
          allDates: result.allDates,
          selectedDate: result.selectedDate,
        };
      }
    } catch (error: any) {
      throw new BadRequestException(`Failed to change date: ${error.message}`);
    }
  }

  @Post('check-ont')
  checkOnt() {
    try {
      const results = this.logisticsService.checkOntSerials();
      return {
        success: true,
        message: `ONT check complete. ${results.filter(r => r.poNumber !== 'Not Found').length} found out of ${results.length} serial numbers.`,
        data: results,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to check ONT: ${error.message}`);
    }
  }
}
