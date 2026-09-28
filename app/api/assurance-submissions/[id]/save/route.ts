import {endpoint,body} from '@/lib/api';
import {getAssuranceSubmissionsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin","controller","technician"],async({request,params,actor})=>getAssuranceSubmissionsController().save(params.id,await body(request),{user:actor}),201);
