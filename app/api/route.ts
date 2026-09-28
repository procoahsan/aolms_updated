import {endpoint} from '@/lib/api';
import {getAppController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint([],async()=>getAppController().getHello(),200);
