import 'server-only';

import { AssuranceSubmissionsService } from './assurance-submissions.service';






export class AssuranceSubmissionsController {
  constructor(private readonly service: AssuranceSubmissionsService) {}
   
  audit( req:any, projectId?:string) { return this.service.audit(req.user,projectId); }
   
  tasks( req:any) { return this.service.tasks(req.user); }
   
  get( id:string, req:any, owner?:string) { return this.service.get(id,req.user,owner); }
   
  save( id:string, body:unknown, req:any) { return this.service.save(id,body,req.user); }
}
