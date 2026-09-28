import {endpoint,body} from '@/lib/api';
import {getServiceDeliveryController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin","controller"],async({request})=>getServiceDeliveryController().verify((await body(request)).selectedDate),201);
