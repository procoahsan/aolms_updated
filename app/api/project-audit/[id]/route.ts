import {endpoint,uuid} from '@/lib/api';
import {getProjectAuditController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller"],async({params})=>getProjectAuditController().run(uuid(params.id)),200);
