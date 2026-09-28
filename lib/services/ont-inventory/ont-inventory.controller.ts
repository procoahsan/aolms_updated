import 'server-only';

import { OntInventoryService } from './ont-inventory.service';
import { CreateOntInventoryDto } from './dto/create-ont-inventory.dto';
import { UpdateOntInventoryDto } from './dto/update-ont-inventory.dto';









export class OntInventoryController {
  constructor(private ontInventoryService: OntInventoryService) {}

  
  
  create( createOntInventoryDto: CreateOntInventoryDto) {
    return this.ontInventoryService.create(createOntInventoryDto);
  }

  
  
  findAll( model?: string,  status?: string) {
    return this.ontInventoryService.findAll({ model, status });
  }

  
  
  findOne( id: string) {
    return this.ontInventoryService.findOne(id);
  }

  
  
  update( id: string,  updateOntInventoryDto: UpdateOntInventoryDto) {
    return this.ontInventoryService.update(id, updateOntInventoryDto);
  }

  
  
  remove( id: string) {
    return this.ontInventoryService.remove(id);
  }
}