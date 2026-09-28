import 'server-only';
import {NotFoundException} from '@/lib/http';
import { OperationsDatabase } from '../legacy-aolms/operations-database';
import { dataVerification, crossVerifyOntCheck, buildFinalOutput } from '../legacy-aolms/service-delivery/utils/sd-validation.util';





export class ProjectAuditService {
  constructor(private readonly database: OperationsDatabase) {}
  async run(projectId: string) {
    const [project] = await this.database.db.query('SELECT id,name,code FROM projects WHERE id=$1', [projectId]);
    if (!project) throw new NotFoundException('Project not found');
    if(project.code !== 'SERVICE_ASSURANCE') return {project,enabled:false,verification:[] as any[],crossVerification:[] as any[],finalOutput:[] as any[]};
    const {records,responses} = await this.database.assuranceAudit(projectId);
    const inventory = await this.database.inventory(records.map(r=>r.nceSN),records.map(r=>r.orderNumber));
    const verification = dataVerification(records,responses);
    const delivered = records.filter(r=>r.actioned.trim().toLowerCase()==='delivered');
    const crossVerification = crossVerifyOntCheck(delivered,responses,inventory.ont,inventory.cpeOrders);
    const finalOutput = buildFinalOutput(delivered,inventory.ont);
    return { project, generatedAt:new Date().toISOString(), verification, crossVerification, finalOutput,
      counts:{orders:records.length,filled:verification.filter(r=>r.orderMatch).length,
        typeMismatch:verification.filter(r=>!r.typeMatch).length,connectionMismatch:verification.filter(r=>!r.connectionMatch).length,
        investigate:crossVerification.filter(r=>r.status==='Investigate').length,output:finalOutput.length},
      exportTemplateReady:false };
  }
}



export class ProjectAuditController {
  constructor(private readonly service:ProjectAuditService) {}
   run( id:string){return this.service.run(id);}
}

export class ProjectAuditModule {}
