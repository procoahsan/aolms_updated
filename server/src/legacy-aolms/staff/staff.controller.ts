import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StaffService } from './staff.service';
import { StaffQueryDto } from './dto/staff.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/role.enum';

@Controller('staff')
@UseGuards(JwtAuthGuard)
@Roles(Role.Admin)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  getAll(@Query() query: StaffQueryDto) {
    return this.staffService.getAll(query);
  }

  @Get('stats')
  getStats() {
    return this.staffService.getStats();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    const staff = this.staffService.getById(id);
    if (!staff) {
      throw new HttpException('Staff member not found', HttpStatus.NOT_FOUND);
    }
    return staff;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    const result = this.staffService.uploadExcel(file.buffer);
    return { message: `Successfully parsed ${result.count} records`, ...result };
  }
}
