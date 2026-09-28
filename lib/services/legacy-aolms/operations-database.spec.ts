import { describe,it,expect,vi } from 'vitest';
import { OperationsDatabase } from './operations-database';
import { ServiceDeliveryService } from './service-delivery/service-delivery.service';
import { StaffService } from './staff/staff.service';
import { crossVerifyOntCheck } from './service-delivery/utils/sd-validation.util';
describe('Database operations',()=>{
 it('does not verify orders as technician responses when no responses exist',()=>{
  expect(crossVerifyOntCheck([{orderNumber:'123'} as any],[],new Map(),new Map())).toEqual([]);
 });
 it('reads fresh staff records instead of caching a startup spreadsheet',async()=>{
  const query=vi.fn().mockResolvedValueOnce([{id:1,data:{name:'Before'}}]).mockResolvedValueOnce([{id:1,data:{name:'After'}}]);
  const service=new StaffService(new OperationsDatabase({query} as any));
  expect((await service.getById(1))?.name).toBe('Before');expect((await service.getById(1))?.name).toBe('After');
 });
 it('keeps date selections request-local between controllers',async()=>{
  const database={delivery:vi.fn().mockResolvedValue([{date:'2026-01-01',actioned:'Delivered'},{date:'2026-01-02',actioned:'Delivered'},{date:'2026-01-03',actioned:'Rejected'}])};
  const service=new ServiceDeliveryService(database as any);
  const [first,second]=await Promise.all([service.records('2026-01-01'),service.records('2026-01-02')]);
  expect(first.records.map(r=>r.date)).toEqual(['2026-01-01']);expect(second.records.map(r=>r.date)).toEqual(['2026-01-02']);
  expect((await service.records()).selectedDate).toBe('2026-01-02');
 });
 it('uses edited ONT database values ahead of historical inventory',async()=>{
  const query=vi.fn().mockResolvedValueOnce([{serial_number:'sn1',po_number:'old',model:'old'},{serial_number:'SN1',po_number:'new',model:'New model'}]).mockResolvedValueOnce([{order_number:'123',serial_number:'sn2'}]);
  const inventory=await new OperationsDatabase({query} as any).inventory();
  expect(inventory.ont.get('SN1')?.poNumber).toBe('new');expect(inventory.cpeOrders.has('123')).toBe(true);
 });
});
