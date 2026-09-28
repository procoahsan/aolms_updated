import {endpoint,body} from '@/lib/api';
import {getCpeInventoryController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin","controller"],async({request})=>getCpeInventoryController().create(await body(request)),201);
export const GET=endpoint(["admin","controller","technician"],async({query})=>getCpeInventoryController().findAll(query.get('project_id') ?? undefined,query.get('serial_number') ?? undefined),200);
