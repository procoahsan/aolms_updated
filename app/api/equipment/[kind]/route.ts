import {endpoint,body} from '@/lib/api';
import {getEquipmentController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller"],async({params,query})=>getEquipmentController().list(params.kind,Object.fromEntries(query)),200);
export const POST=endpoint(["admin","controller"],async({request,params,actor})=>getEquipmentController().create(params.kind,await body(request),{user:actor}),201);
