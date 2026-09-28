import 'server-only';

import { CpeInventoryService } from './cpe-inventory.service';
import { CreateCpeInventoryDto } from './dto/create-cpe-inventory.dto';
import { UpdateCpeInventoryDto } from './dto/update-cpe-inventory.dto';









export class CpeInventoryController {
  constructor(private cpeInventoryService: CpeInventoryService) {}

  
  
  create( createCpeInventoryDto: CreateCpeInventoryDto) {
    return this.cpeInventoryService.create(createCpeInventoryDto);
  }

  
  
  findAll( project_id?: string,  serial_number?: string) {
    return this.cpeInventoryService.findAll({ project_id, serial_number });
  }

  
  
  findOne( id: string) {
    return this.cpeInventoryService.findOne(id);
  }

  
  
  update( id: string,  updateCpeInventoryDto: UpdateCpeInventoryDto) {
    return this.cpeInventoryService.update(id, updateCpeInventoryDto);
  }

  
  
  remove( id: string) {
    return this.cpeInventoryService.remove(id);
  }
}