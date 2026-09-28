import {endpoint} from '@/lib/api';
import {getServiceDeliveryController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller"],async()=>getServiceDeliveryController().records(),200);
