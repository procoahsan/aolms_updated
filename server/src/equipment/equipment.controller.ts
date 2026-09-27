import { BadRequestException, Body, ConflictException, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

const fields = ['item_code','receiving_date','reservation_number','serial_number','quantity','model','po_number','stock_type','service','order_number','installation_date','cost_center','exchange','block','road','house','flat','asset_description','asset_class','contractor','connection_type','lo_name','labor_charge','cpe_charge','reference'];
@Controller('equipment')
@UseGuards(JwtAuthGuard)
@Roles(Role.Admin, Role.Controller)
export class EquipmentController {
 constructor(private readonly db:DataSource) {}
 private kind(value:string) { if(!['ont','cpe'].includes(value)) throw new BadRequestException('Invalid database'); return value; }
 @Get(':kind/meta')
 async meta(@Param('kind') kind:string) {
  const categories=await this.db.query('SELECT category,count(*)::int AS count FROM equipment_records WHERE kind=$1 GROUP BY category ORDER BY category',[this.kind(kind)]);
  const years=await this.db.query('SELECT DISTINCT source_year FROM equipment_records WHERE kind=$1 AND source_year IS NOT NULL ORDER BY source_year DESC',[kind]);
  return {categories,years:years.map((r:{source_year:string})=>r.source_year)};
 }
 @Get(':kind')
 async list(@Param('kind') kind:string,@Query() q:Record<string,string>) {
  const page=Math.max(1,Math.min(1000000,Number(q.page)||1));
  const params=[this.kind(kind),q.category||'',q.year||'',(q.search||'').slice(0,200)];
  const where="kind=$1 AND ($2='' OR category=$2) AND ($3='' OR source_year=$3) AND ($4='' OR strpos(lower(data::text),lower($4))>0)";
  const [count]=await this.db.query(`SELECT count(*)::int AS total FROM equipment_records WHERE ${where}`,params);
  const rows=await this.db.query(`SELECT id,category,data,source_sheet,source_row,source_year,version,updated_at FROM equipment_records WHERE ${where} ORDER BY created_at DESC,id LIMIT 50 OFFSET $5`,[...params,(Math.floor(page)-1)*50]);
  return {rows,total:count.total,page:Math.floor(page)};
 }
 private validate(kind:string,body:any) {
  this.kind(kind);
  if(!body || typeof body.category!=='string' || !body.category.trim() || body.category.length>200 || !body.data || typeof body.data!=='object' || Array.isArray(body.data)) throw new BadRequestException('Category and record fields are required');
  const data:Record<string,string|number|null>={};
  for(const [key,value] of Object.entries(body.data)) {
   if(!fields.includes(key)) throw new BadRequestException(`Unknown field: ${key}`);
   if(value!==null && typeof value!=='string' && typeof value!=='number') throw new BadRequestException('Invalid field value');
   if(String(value??'').length>1000) throw new BadRequestException('Field exceeds 1000 characters');
   data[key]=typeof value==='string'?value.trim():value as number|null;
   if(['quantity','labor_charge','cpe_charge'].includes(key) && value!==null && value!=='') {
    const number=Number(value); if(!Number.isFinite(number)||number<0) throw new BadRequestException(`${key} must be a nonnegative number`);data[key]=number;
   }
   if(['receiving_date','installation_date'].includes(key) && value && (!/^\d{4}-\d{2}-\d{2}$/.test(String(value)) || !Number.isFinite(Date.parse(String(value))))) throw new BadRequestException('Use a valid date');
  }
  if(!String(data.serial_number||'').trim()) throw new BadRequestException('Serial number is required');
  if(kind==='ont' && !String(data.model||'').trim()) throw new BadRequestException('Model is required');
  const year=body.source_year||null;
  if(year!==null && !/^\d{4}$/.test(String(year))) throw new BadRequestException('Year must contain four digits');
  return {data,category:kind==='ont'?String(data.model):body.category.trim(),year};
 }
 @Post(':kind')
 async create(@Param('kind') kind:string,@Body() body:any,@Request() req:any) {
  const v=this.validate(kind,body);
  return this.db.transaction(async tx=>{
   const [record]=await tx.query('INSERT INTO equipment_records(kind,category,data,source_year,updated_by) VALUES($1,$2,$3,$4,$5) RETURNING *',[kind,v.category,JSON.stringify(v.data),v.year,req.user.userId]);
   await tx.query('INSERT INTO equipment_changes(record_id,actor_id,after_data) VALUES($1,$2,$3)',[record.id,req.user.userId,JSON.stringify(record)]);return record;
  });
 }
 @Patch(':kind/:id')
 async update(@Param('kind') kind:string,@Param('id',ParseUUIDPipe) id:string,@Body() body:any,@Request() req:any) {
  const v=this.validate(kind,body);
  if(!Number.isInteger(body.version)) throw new BadRequestException('Record version is required');
  return this.db.transaction(async tx=>{
   const [old]=await tx.query('SELECT * FROM equipment_records WHERE id=$1 AND kind=$2 FOR UPDATE',[id,kind]);
   if(!old || old.version!==body.version) throw new ConflictException('Record changed. Close and refresh before editing again.');
   const [record]=await tx.query('UPDATE equipment_records SET category=$2,data=$3,source_year=$4,version=version+1,updated_by=$5,updated_at=now() WHERE id=$1 RETURNING *',[id,v.category,JSON.stringify(v.data),v.year,req.user.userId]);
   await tx.query('INSERT INTO equipment_changes(record_id,actor_id,before_data,after_data) VALUES($1,$2,$3,$4)',[id,req.user.userId,JSON.stringify(old),JSON.stringify(record)]);return record;
  });
 }
}
