import {endpoint,body} from '@/lib/api';
import {getAssuranceTicketsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin","controller"],async({request,actor})=>getAssuranceTicketsController().save(await body(request),{user:actor}),201);
