import {endpoint,validateAccount} from '@/lib/api';
import {getProfilesController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const POST=endpoint(["admin"],async({request})=>getProfilesController().createAccount(await validateAccount(request)),201);
