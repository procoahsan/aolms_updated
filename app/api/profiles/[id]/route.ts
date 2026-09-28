import {endpoint,body} from '@/lib/api';
import {getProfilesController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller","technician"],async({params})=>getProfilesController().findOne(params.id),200);
export const PATCH=endpoint(["admin"],async({request,params})=>getProfilesController().update(params.id,await body(request)),200);
export const DELETE=endpoint(["admin"],async({params})=>getProfilesController().remove(params.id),200);
