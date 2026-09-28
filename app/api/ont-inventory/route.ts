import {endpoint,body} from '@/lib/api';
import {getOntInventoryController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin","controller"],async({request})=>getOntInventoryController().create(await body(request)),201);
export const GET=endpoint(["admin","controller","technician"],async({query})=>getOntInventoryController().findAll(query.get('model') ?? undefined,query.get('status') ?? undefined),200);
