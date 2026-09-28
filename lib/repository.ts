import 'server-only';
import {db} from './db';
import {BadRequestException} from './http';
type FindOptions={where?:Record<string,unknown>;order?:Record<string,'ASC'|'DESC'>};
// Explicit table/column lists are generated from the former entity definitions.
// Values are always bound parameters; request input never becomes a SQL identifier.
export class Repository<T extends object>{
 constructor(private table:string,private fields:string[]){}
 private col(key:string){if(!this.fields.includes(key))throw new BadRequestException(`Unknown field: ${key}`);return `"${key}"`;}
 create(value:Partial<T>):T{return {...value} as T;}
 async find(options:FindOptions={}):Promise<T[]>{
  const entries=Object.entries(options.where||{}).filter(([,v])=>v!==undefined);
  const where=entries.map(([k],i)=>`${this.col(k)}=$${i+1}`).join(' AND ');
  const order=Object.entries(options.order||{}).map(([k,v])=>`${this.col(k)} ${v==='DESC'?'DESC':'ASC'}`).join(',');
  return db.query(`SELECT * FROM "${this.table}"${where?' WHERE '+where:''}${order?' ORDER BY '+order:''}`,entries.map(([,v])=>v));
 }
 async findOne(options:FindOptions):Promise<T|null>{return (await this.find(options))[0]||null;}
 async preload(value:Partial<T>&{id:string}):Promise<T|null>{const old=await this.findOne({where:{id:value.id}});return old?{...old,...value}:null;}
 async save(value:T):Promise<T>{
  if(this.fields.includes('updated_at'))value={...value,updated_at:new Date()};
  const entries=Object.entries(value).filter(([k,v])=>this.fields.includes(k)&&v!==undefined);
  if(!entries.length)return (await db.query(`INSERT INTO "${this.table}" DEFAULT VALUES RETURNING *`))[0];
  const columns=entries.map(([k])=>this.col(k)),updates=entries.filter(([k])=>!['id','created_at'].includes(k)).map(([k])=>`${this.col(k)}=EXCLUDED.${this.col(k)}`);
  const conflict=entries.some(([k])=>k==='id')?` ON CONFLICT (id) ${updates.length?'DO UPDATE SET '+updates.join(','):'DO NOTHING'}`:'';
  return (await db.query(`INSERT INTO "${this.table}" (${columns.join(',')}) VALUES (${entries.map((_,i)=>'$'+(i+1)).join(',')})${conflict} RETURNING *`,entries.map(([,v])=>v)))[0];
 }
 async upsert(value:Partial<T>,_keys:string[]){return this.save(value as T);}
 async delete(id:string){const rows=await db.query(`DELETE FROM "${this.table}" WHERE id=$1 RETURNING id`,[id]);return {affected:rows.length};}
 createQueryBuilder(_alias:string){
  const where:Record<string,unknown>={};const builder={andWhere:(expression:string,params:Record<string,unknown>)=>{
   const match=expression.match(/^\w+\.(\w+) = :(\w+)$/);if(!match)throw new Error('Unsupported repository predicate');this.col(match[1]);where[match[1]]=params[match[2]];return builder;
  },getMany:()=>this.find({where})};return builder;
 }
}
