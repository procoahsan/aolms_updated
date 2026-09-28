import {describe,it,expect,vi,beforeEach} from 'vitest';
const query=vi.hoisted(()=>vi.fn());
vi.mock('@/lib/db',()=>({db:{query}}));
import {Repository} from '@/lib/repository';
beforeEach(()=>query.mockReset().mockResolvedValue([{id:'1',name:'saved'}]));
describe('PostgreSQL repository compatibility',()=>{
 it('binds values and retains project sequence ordering',async()=>{
  await new Repository('projects',['id','name','display_order']).find({where:{name:"x' OR 1=1"},order:{display_order:'ASC',name:'ASC',id:'ASC'}});
  expect(query).toHaveBeenCalledWith('SELECT * FROM "projects" WHERE "name"=$1 ORDER BY "display_order" ASC,"name" ASC,"id" ASC',["x' OR 1=1"]);
 });
 it('retains relation UUID columns and updates timestamps',async()=>{
  await new Repository('orders',['id','project_id','updated_at']).save({id:'1',project_id:'project'});
  expect(query.mock.calls[0][0]).toContain('ON CONFLICT (id) DO UPDATE SET');
  expect(query.mock.calls[0][1]).toEqual(['1','project',expect.any(Date)]);
 });
 it('does not allow arbitrary SQL columns',async()=>{
  await expect(new Repository('projects',['id']).find({where:{'id; DROP TABLE projects':1}})).rejects.toThrow('Unknown field');expect(query).not.toHaveBeenCalled();
 });
});
