import {endpoint} from '@/lib/api';
import {getStaffController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin"],async({query})=>getStaffController().getAll(Object.fromEntries(query)),200);
