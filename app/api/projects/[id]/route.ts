import {endpoint,body} from '@/lib/api';
import {getProjectsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller","technician"],async({params})=>getProjectsController().findOne(params.id),200);
export const PATCH=endpoint(["admin"],async({request,params})=>getProjectsController().update(params.id,await body(request)),200);
export const DELETE=endpoint(["admin"],async({params})=>getProjectsController().remove(params.id),200);
