import { describe,it,expect,vi } from 'vitest';
import { ProjectAuditService } from './project-audit.module';
import { dataVerification,crossVerifyOntCheck,buildFinalOutput } from '../legacy-aolms/service-delivery/utils/sd-validation.util';
import { OperationsDatabase } from '../legacy-aolms/operations-database';

describe('Project audit',()=>{
 it('scopes data to the selected project and exactly reuses the Operations Center rules',async()=>{
  const records=[{orderNumber:'2345',date:'2026-09-28',orderType:'New',connectionType:'Home Pass',actioned:'Delivered',nceSN:'SN1'},
   {orderNumber:'2346',date:'2026-09-28',orderType:'External',connectionType:'Reprovide',actioned:'Delivered',nceSN:'SN1'},
   {orderNumber:'2347',orderType:'New',actioned:'Pending'}] as any[];
  const responses=[{orderNumber:'2345',fttrOrderType:'New FTTR',connectionType:'Home Pass (Overhead Splitter)'},{orderNumber:'2346',fttrOrderType:'External - Shift (Modify)',connectionType:'Re-Provide'}] as any[];
  const inventory={ont:new Map([['SN1',{poNumber:'PO1',assetDescription:'WiFi 6',sheetNames:['WiFi 6']}]]),cpeOrders:new Map<string,boolean>()};
  const database={db:{query:vi.fn().mockResolvedValue([{code:'SERVICE_ASSURANCE'}])},assuranceAudit:vi.fn().mockResolvedValue({records,responses}),inventory:vi.fn().mockResolvedValue(inventory)};
  const result=await new ProjectAuditService(database as any).run('project');
  expect(database.assuranceAudit).toHaveBeenCalledWith('project');
  expect(result.verification).toEqual(dataVerification(records,responses));
  expect(result.verification[2].orderMatch).toBe(false);
  expect(result.crossVerification).toEqual(crossVerifyOntCheck(records.slice(0,2),responses,inventory.ont,inventory.cpeOrders));
  expect(result.crossVerification[1].status).toBe('Investigate');
  expect(result.finalOutput).toEqual(buildFinalOutput(records,inventory.ont));expect(result.finalOutput).toHaveLength(1);
 });
 it.each(['SERVICE_DELIVERY','FTTR','2G_REPLACEMENT','OTHER'])('leaves %s blank',async(code)=>{
  const database={db:{query:vi.fn().mockResolvedValue([{code}])},delivery:vi.fn().mockResolvedValue([]),responses:vi.fn().mockResolvedValue([]),inventory:vi.fn().mockResolvedValue({ont:new Map(),cpeOrders:new Map()})};
  const result=await new ProjectAuditService(database as any).run('fttr');expect(result.verification).toEqual([]);expect(database.responses).not.toHaveBeenCalled();expect(database.delivery).not.toHaveBeenCalled();
 });
 it('maps Assurance tickets and independent submitted answers without filling missing values',async()=>{
  const db={query:vi.fn().mockResolvedValue([
   {ticket_number:'2001',status:'Resolved',spreadsheet_fields:{wbs_type:'New',wbs_connection_type:'Home Pass',new_ont_sn:'CONTROLLER-SN'},submission:{submitted_at:'2026-09-28',response_order_type:'External',response_connection_type:'Home Connect',new_cpe_sn:'TECH-SN'}},
   {ticket_number:'2002',status:'Pending',spreadsheet_fields:{},submission:null}
  ])};
  const {records,responses}=await new OperationsDatabase(db as any).assuranceAudit('assurance-project');
  expect(db.query.mock.calls[0][1]).toEqual(['assurance-project']);
  expect(records[0]).toMatchObject({orderNumber:'2001',actioned:'Delivered',orderType:'New',connectionType:'Home Pass',nceSN:'CONTROLLER-SN'});
  expect(responses[0]).toMatchObject({fttrOrderType:'External',connectionType:'Home Connect'});
  expect(responses).toHaveLength(1);expect(records[1].orderType).toBe('');
  expect(dataVerification(records,responses)[0].typeMatch).toBe(false);
 });
 it('does not substitute WBS values for missing technician answers',async()=>{
  const db={query:vi.fn().mockResolvedValue([{order_number:'1',order_type:'New',connection_type:'Home Pass',response_order_type:null,response_connection_type:null}])};
  const rows=await new OperationsDatabase(db as any).responses('p',false);
  expect(rows[0].fttrOrderType).toBe('');expect(rows[0].connectionType).toBe('');
 });
 it('keeps Delivered action from the controller when technician answers Yes',async()=>{
  const db={query:vi.fn().mockResolvedValue([{action:'Delivered',submission:{actioned:'Yes'}}])};
  expect((await new OperationsDatabase(db as any).delivery('p'))[0].actioned).toBe('Delivered');
 });
});
