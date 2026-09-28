import 'server-only';

import { AssuranceTicketsService } from './assurance-tickets.service';






export class AssuranceTicketsController {
  constructor(private readonly service: AssuranceTicketsService) {}
   
  metadata( req: any) { return this.service.metadata(req.user); }
   
  save( body: unknown,  req: any) { return this.service.saveRows(body, req.user); }
   
  list( req: any,  projectId?: string) { return this.service.findAll(req.user, projectId); }
   
  one( id: string,  req: any) { return this.service.findOne(id, req.user); }
}
