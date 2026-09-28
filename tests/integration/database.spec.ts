import {describe,it,expect,afterAll} from 'vitest';
import {db,getPool} from '@/lib/db';
import {getProjectsService,getOperationsDatabase,getProjectAuditService,getStaffService,getServiceDeliveryService} from '@/lib/services/registry';
describe('Existing Supabase database (read only)',()=>{
 afterAll(async()=>{await getPool().end();});
 it('reads existing projects in the saved display sequence',async()=>{
  const service=await getProjectsService().findAll();
  const sql=await db.query('SELECT id FROM projects ORDER BY display_order,name,id');
  expect(service.map(p=>p.id)).toEqual(sql.map(p=>p.id));
 });
 it('rebuilds database-backed operational pages and audit after a cold start',async()=>{
  const [project]=await db.query("SELECT id FROM projects WHERE code='SERVICE_ASSURANCE'");
  const audit=await getProjectAuditService().run(project.id);
  const [count]=await db.query('SELECT count(*)::int n FROM assurance_tickets WHERE project_id=$1',[project.id]);
  expect(audit.verification).toHaveLength(count.n);
  expect((await getStaffService().getStats()).total).toBeGreaterThan(0);
  expect((await getServiceDeliveryService().getStatus()).responseRecordCount).toBeGreaterThan(0);
  const records=await getOperationsDatabase().delivery();
  expect(records.length).toBeGreaterThan(0);
 },60000);
 it('supports atomic multi-query transactions without persisting a test mutation',async()=>{
  await expect(db.transaction(async tx=>{await tx.query('SELECT 1');throw new Error('rollback probe')})).rejects.toThrow('rollback probe');
  expect((await db.query('SELECT 1 AS value'))[0].value).toBe(1);
 });
});
