import {endpoint,body} from '@/lib/api';
import {getProfilesController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin"],async({request})=>getProfilesController().create(await body(request)),201);
export const GET=endpoint(["admin","controller","technician"],async()=>getProfilesController().findAll(),200);
