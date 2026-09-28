// Integration checks roll back all test changes.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {Client}=require('pg');
require('dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const {EquipmentController}=require('../dist/equipment/equipment.controller');
const db=new Client({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||5432),user:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_DATABASE||'postgres',ssl:{rejectUnauthorized:false}});
(async()=>{await db.connect();await db.query('BEGIN');try{
 const query=async(sql,params)=>(await db.query(sql,params)).rows;
 const controller=new EquipmentController({query,transaction:fn=>fn({query})});
 const source=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const counts=await query('SELECT kind,count(*)::int AS n FROM equipment_records GROUP BY kind');
 for(const kind of ['ont','cpe'])assert.equal(counts.find(r=>r.kind===kind).n,source.filter(r=>r.kind===kind).length);
 const [{n}]=await query(`SELECT count(*)::int n FROM equipment_records WHERE original_data IS NOT NULL AND data->>'serial_number' IS NOT NULL`);assert.equal(n,source.length);
 const meta=await controller.meta('ont');assert.equal(meta.categories.length,4);
 const result=await controller.list('cpe',{category:'Delivery Assurance',year:'2023',search:'48575443',page:'1'});assert.equal(result.rows.length,50);
 const row=(await controller.list('ont',{})).rows[0];
 const req={user:{userId:'11111111-1111-4111-8111-111111111111'}};
 const updated=await controller.update('ont',row.id,{...row,data:{...row.data,quantity:2}},req);assert.equal(updated.version,row.version+1);
 await assert.rejects(()=>controller.update('ont',row.id,row,req),/Record changed/);
 const [history]=await query('SELECT * FROM equipment_changes WHERE record_id=$1',[row.id]);assert.equal(history.before_data.version,row.version);
 const created=await controller.create('cpe',{category:'Delivery Assurance',source_year:'2026',data:{serial_number:'INTEGRATION-ROLLBACK',quantity:1}},req);
 assert.equal(created.category,'Delivery Assurance');
 const policy=await query("SELECT relrowsecurity FROM pg_class WHERE relname IN ('equipment_records','equipment_changes')");assert.ok(policy.every(r=>r.relrowsecurity));
 console.log('PASS: source totals, provenance, four ONT models, year/search pagination, edit persistence, stale edit conflict, audit, new entries, RLS. Test changes rolled back.');
 }finally{await db.query('ROLLBACK')}})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>db.end());
