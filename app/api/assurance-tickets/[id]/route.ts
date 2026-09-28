import {endpoint} from '@/lib/api';
import {getAssuranceTicketsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller","technician"],async({params,actor})=>getAssuranceTicketsController().one(params.id,{user:actor}),200);
