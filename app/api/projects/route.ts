import {endpoint,body} from '@/lib/api';
import {getProjectsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin"],async({request})=>getProjectsController().create(await body(request)),201);
export const GET=endpoint(["admin","controller","technician"],async()=>getProjectsController().findAll(),200);
