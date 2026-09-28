import {endpoint} from '@/lib/api';
import {getAssuranceSubmissionsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller","technician"],async({params,query,actor})=>getAssuranceSubmissionsController().get(params.id,{user:actor},query.get('technician_id') ?? undefined),200);
