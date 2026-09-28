import {endpoint} from '@/lib/api';
import {getLogisticsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin","controller"],async()=>getLogisticsController().records(),200);
