import {endpoint} from '@/lib/api';
import {getAssuranceTicketsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller","technician"],async({query,actor})=>getAssuranceTicketsController().list({user:actor},query.get('project_id') ?? undefined),200);
