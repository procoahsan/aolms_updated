import {endpoint} from '@/lib/api';
import {getAssuranceSubmissionsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller"],async({query,actor})=>getAssuranceSubmissionsController().audit({user:actor},query.get('project_id') ?? undefined),200);
