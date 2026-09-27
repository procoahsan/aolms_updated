import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { EquipmentController } from './equipment.controller';
import { ROLES_KEY } from '../auth/roles.decorator';

const body={category:'Delivery Assurance',data:{serial_number:'SN001',quantity:'1'},source_year:'2026',version:1};
describe('Equipment database',()=>{
 it('restricts every endpoint to administrators and controllers',()=>{
  expect(Reflect.getMetadata(ROLES_KEY,EquipmentController)).toEqual(['admin','controller']);
 });
 it('rejects invalid fields and quantities before database writes',async()=>{
  const db={transaction:vi.fn()}; const controller=new EquipmentController(db as any);
  for(const data of [{serial_number:''},{serial_number:'SN',quantity:-1},{serial_number:'SN',unexpected:'x'},{serial_number:'SN',installation_date:'bad'}]) {
   await expect(controller.create('cpe',{...body,data},{user:{userId:'x'}})).rejects.toThrow();
  }
  expect(db.transaction).not.toHaveBeenCalled();
 });
 it('rejects stale edits and leaves the record untouched',async()=>{
  const query=vi.fn().mockResolvedValue([{version:2}]);
  const controller=new EquipmentController({transaction:fn=>fn({query})} as any);
  await expect(controller.update('cpe','id',body,{user:{userId:'x'}})).rejects.toThrow('Record changed');
  expect(query).toHaveBeenCalledTimes(1);
 });
 it('updates with normalized values and stores the prior version in audit history',async()=>{
  const old={id:'id',version:1,data:{serial_number:'SN001',quantity:3}};
  const query=vi.fn().mockResolvedValueOnce([old]).mockResolvedValueOnce([{...old,version:2}]).mockResolvedValueOnce([]);
  const controller=new EquipmentController({transaction:fn=>fn({query})} as any);
  await controller.update('cpe','id',body,{user:{userId:'actor'}});
  expect(query.mock.calls[1][1][2]).toBe(JSON.stringify({serial_number:'SN001',quantity:1}));
  expect(query.mock.calls[2][1][2]).toBe(JSON.stringify(old));
 });
 it('uses bound search values and a limited page size',async()=>{
  const query=vi.fn().mockResolvedValueOnce([{total:0}]).mockResolvedValueOnce([]);
  const controller=new EquipmentController({query} as any);
  await controller.list('ont',{search:"' OR true --",page:'2'});
  expect(query.mock.calls[1][0]).toContain('LIMIT 50 OFFSET $5');
  expect(query.mock.calls[1][1]).toEqual(['ont','','',"' OR true --",50]);
 });
});
