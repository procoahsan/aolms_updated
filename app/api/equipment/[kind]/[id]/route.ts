import {endpoint,body,uuid} from '@/lib/api';
import {getEquipmentController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const PATCH=endpoint(["admin","controller"],async({request,params,actor})=>getEquipmentController().update(params.kind,uuid(params.id),await body(request),{user:actor}),200);
