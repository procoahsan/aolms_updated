import {endpoint} from '@/lib/api';
import {getEquipmentController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller"],async({params})=>getEquipmentController().meta(params.kind),200);
