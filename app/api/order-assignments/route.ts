import {endpoint,body} from '@/lib/api';
import {getOrderAssignmentsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin","controller"],async({request})=>getOrderAssignmentsController().create(await body(request)),201);
export const GET=endpoint(["admin","controller","technician"],async({actor})=>getOrderAssignmentsController().findAll({user:actor}),200);
