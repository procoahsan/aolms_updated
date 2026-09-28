import {endpoint} from '@/lib/api';
import {getAuditLogsController} from '@/lib/services/registry';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export const GET=endpoint(["admin"],async()=>getAuditLogsController().findAll(),200);
