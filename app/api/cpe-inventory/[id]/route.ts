import {endpoint,body} from '@/lib/api';
import {getCpeInventoryController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller","technician"],async({params})=>getCpeInventoryController().findOne(params.id),200);
export const PATCH=endpoint(["admin","controller"],async({request,params})=>getCpeInventoryController().update(params.id,await body(request)),200);
export const DELETE=endpoint(["admin"],async({params})=>getCpeInventoryController().remove(params.id),200);
