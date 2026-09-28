// Usage: node scripts/import-equipment.cjs <extracted JSON>. Re-runs preserve controller edits.
const fs=require('node:fs');
const path=require('node:path');
const {Client}=require('pg');
require('./environment.cjs');
const db=new Client({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||5432),user:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_DATABASE||'postgres',ssl:{rejectUnauthorized:false}});
(async()=>{
 await db.connect();
 await db.query(fs.readFileSync(path.join(__dirname,'../../database/migrations/20260927_equipment_database.sql'),'utf8'));
 const rows=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));let inserted=0;
 await db.query('BEGIN');
 try {
  for(let i=0;i<rows.length;i+=500){
   const result=await db.query(`INSERT INTO equipment_records(kind,category,data,source_file,source_sheet,source_row,source_year,original_data)
    SELECT kind,category,data,source_file,source_sheet,source_row,source_year,original_data
    FROM jsonb_to_recordset($1::jsonb) AS r(kind text,category text,data jsonb,source_file text,source_sheet text,source_row int,source_year text,original_data jsonb)
    ON CONFLICT(kind,source_file,source_sheet,source_row) DO NOTHING`,[JSON.stringify(rows.slice(i,i+500))]);inserted+=result.rowCount;
  }
  await db.query('COMMIT');
  console.log(JSON.stringify({source:rows.length,inserted,counts:(await db.query('SELECT kind,category,count(*)::int AS count FROM equipment_records GROUP BY kind,category ORDER BY kind,category')).rows},null,2));
 }catch(e){await db.query('ROLLBACK');throw e;}
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>db.end());
