import 'server-only';
import {HttpException,HttpStatus} from '@/lib/http';
import { StaffService } from './staff.service';
import { StaffQueryDto } from './dto/staff.dto';







export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  
  getAll( query: StaffQueryDto) {
    return this.staffService.getAll(query);
  }

  
  getStats() {
    return this.staffService.getStats();
  }

  
  async getById( id: number) {
    const staff = await this.staffService.getById(id);
    if (!staff) {
      throw new HttpException('Staff member not found', HttpStatus.NOT_FOUND);
    }
    return staff;
  }

}
