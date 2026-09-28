import {endpoint} from '@/lib/api';
import {getAssuranceSubmissionsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["technician"],async({actor})=>getAssuranceSubmissionsController().tasks({user:actor}),200);
