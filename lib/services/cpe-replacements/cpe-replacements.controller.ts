import 'server-only';

import { CpeReplacementsService } from './cpe-replacements.service';









export class CpeReplacementsController {
  constructor(private cpeReplacementsService: CpeReplacementsService) {}

  
  
  findAll() {
    return this.cpeReplacementsService.findAll();
  }
}