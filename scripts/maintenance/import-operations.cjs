const fs=require('node:fs'),path=require('node:path'),readline=require('node:readline');
const {Client}=require('pg');require('./environment.cjs');
const connection={host:process.env.DB_HOST,port:+process.env.DB_PORT,user:process.env.DB_USERNAME,password:process.env.DB_PASSWORD,database:process.env.DB_DATABASE,ssl:{rejectUnauthorized:false},connectionTimeoutMillis:15000};
const makeClient=()=>{const client=new Client(connection);client.on('error',()=>{});return client;};
const db=makeClient();
const workers=Array.from({length:4},makeClient);
const text=(d,...keys)=>{for(const k of keys)if(d[k]!=null&&String(d[k]).trim())return String(d[k]).trim();return ''};
const date=v=>{if(!v)return null;if(typeof v==='number')return v>20000&&v<80000?new Date(Math.round((v-25569)*86400000)).toISOString().slice(0,10):null;const s=String(v);return /^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(0,10):null};
const staffKeys={name:'name',contactPersonal:'contact personal',contactOffice:'contact office',cpr:'cpr',cprExpiry:'cpr expiry',conIdBnet:'con id bnet',bnetIdExpiry:'bnet id expiry',conIdBatelco:'con id batelco',batelcoExpiry:'batelco expiry',rpExpiry:'rp expiry contract expiry 1 day before expiry',nationality:'nationality',passportExpiry:'passport expiry',noc:'noc',picture:'picture',visa:'visa',missingData:'missing data',checkBnetCard:'check bnet card',checkCprExpiry:'check cpr expiry',checkRpExpiry:'check rp expiry',checkPassportExpiry:'check passport expiry',checkBatelcoExpiry:'check batelco expiry',commentsOnExpiry:'comments on expiry',bnetCardStatus:'bnet card status',status:'active resigned notice period lwd',staffCategory:'staff category'};
async function insert(table,rows,columns,conflict){
 if(!rows.length)return;
 let next=0,done=0;
 await Promise.all(workers.map(async (client,workerIndex)=>{while(next<rows.length){
  const i=next;next+=25;
  const batch=rows.slice(i,i+25).map(r=>Object.fromEntries(columns.map(k=>[k,['data','original_cells','legacy_data'].includes(k)&&typeof r[k]==='string'?JSON.parse(r[k]):r[k]??null])));
  for(let attempt=0;;attempt++){
   try {await client.query({text:`INSERT INTO ${table} (${columns.join(',')}) SELECT ${columns.join(',')} FROM jsonb_populate_recordset(NULL::${table},$1::jsonb) ON CONFLICT ${conflict} DO NOTHING`,values:[JSON.stringify(batch)],query_timeout:15000});break;}
   catch(error){if(attempt>=3||!/(timeout|connection|ECONN)/i.test(error.message))throw error;console.log(`${table}: reconnecting batch ${i}`);client.connection.stream.destroy();client=makeClient();workers[workerIndex]=client;await client.connect();}
  }
  done+=batch.length;if(done%5000===0||done===rows.length)console.log(`${table}: ${done}/${rows.length}`);
 }}));
}
(async()=>{await db.connect();await db.query(fs.readFileSync(path.join(__dirname,'../../database/migrations/20260927_database_operations.sql'),'utf8'));const projects=Object.fromEntries((await db.query('SELECT code,id FROM projects')).rows.map(r=>[r.code,r.id]));
 const rows=[];for await(const line of readline.createInterface({input:fs.createReadStream(process.argv[2]),crlfDelay:Infinity}))if(line.trim())rows.push(JSON.parse(line));
 // Each batch is atomic and repeatable; completed batches survive a network interruption.
 await Promise.all(workers.map(client=>client.connect()));try{
 const history=rows.map(r=>({...r,data:JSON.stringify(r.data),original_cells:JSON.stringify(r.original_cells),reference:text(r.data,'ticket no','ticket number','order number','order','order id','ticket number order number'),work_date:date(r.data.date||r.data.timestamp)}));
 const groups=(await db.query('SELECT source_file,source_sheet,count(*)::int n FROM operations_history GROUP BY source_file,source_sheet')).rows;
 const pending=[];
 for(const group of new Set(history.map(r=>JSON.stringify([r.source_file,r.source_sheet])))){
  const [file,sheet]=JSON.parse(group), candidates=history.filter(r=>r.source_file===file&&r.source_sheet===sheet);
  const saved=groups.find(r=>r.source_file===file&&r.source_sheet===sheet);
  if(saved?.n===candidates.length)continue;
  const existing=new Set(saved?(await db.query('SELECT source_row FROM operations_history WHERE source_file=$1 AND source_sheet=$2',[file,sheet])).rows.map(r=>r.source_row):[]);
  pending.push(...candidates.filter(r=>!existing.has(r.source_row)));
 }
 console.log(`History remaining: ${pending.length}/${history.length}`);
 await insert('operations_history',pending,['source_file','source_sheet','source_row','dataset','reference','work_date','data','original_cells'],'(source_file,source_sheet,source_row)');
 const staff=rows.filter(r=>r.dataset==='staff'&&r.data.name).map(r=>({data:JSON.stringify(Object.fromEntries(Object.entries(staffKeys).map(([k,v])=>[k,text(r.data,v)]))),source_key:r.source_file+':'+r.source_sheet+':'+r.source_row}));
 await insert('staff_members',staff,['data','source_key'],'(source_key)');
 const tickets=rows.filter(r=>r.dataset==='logistics'&&text(r.data,'ticket no')).map(r=>{const d=r.data;return {project_id:projects.SERVICE_ASSURANCE,ticket_number:text(d,'ticket no'),work_date:date(d.date),team:text(d,'team'),package:text(d,'package'),exchange:text(d,'exchange'),block:text(d,'block'),road:text(d,'road'),building:text(d,'bldg'),flat:text(d,'flat'),lo_name:text(d,'lo name list'),circuit:text(d,'circuit'),status:text(d,'status','column 23'),legacy_data:JSON.stringify(d)}});
 await insert('assurance_tickets',tickets,Object.keys(tickets[0]||{}),'(ticket_number)');
 // Order-detail sheets are authoritative; daily sheets remain fully preserved in history.
 const orders=rows.filter(r=>r.dataset==='wbs'&&/order details/i.test(r.source_sheet)&&text(r.data,'order','order id')).map(r=>{const d=r.data;return {project_id:projects.SERVICE_DELIVERY,order_number:text(d,'order','order id'),work_date:date(d.date||d['action date']),team:text(d,'team'),exchange:text(d,'exc','exchange'),contact:text(d,'contact'),lo:text(d,'lo'),service_identifier:text(d,'service identifier'),order_type:text(d,'type'),connection_type:text(d,'connection type'),fttr_type:text(d,'fttr type'),action:text(d,'actioned'),block:text(d,'block'),road:text(d,'road'),building:text(d,'build'),flat:text(d,'flat'),package:text(d,'package'),legacy_data:JSON.stringify(d),import_key:r.source_file+':'+r.source_sheet+':'+r.source_row}});
 await insert('orders',orders,Object.keys(orders[0]||{}),'(import_key)');
 const cpe=rows.filter(r=>r.dataset==='cpe_reference'&&text(r.data,'serial number')).map(r=>{const d=r.data;return {serial_number:text(d,'serial number'),order_number:text(d,'order number'),installation_date:date(d['installation date']),asset_description:text(d,'asset description','asset description primary or edge'),po_number:text(d,'po','po reservation number'),source_sheet:r.source_sheet,source_year:/^\d{4}/.test(r.source_sheet)?+r.source_sheet.slice(0,4):null,import_key:r.source_file+':'+r.source_sheet+':'+r.source_row}});
 await insert('cpe_inventory',cpe,Object.keys(cpe[0]||{}),'(import_key)');
 const config={'Wifi 6 ONT Summary':[7,1],'Voice H5 ONT Summary':[1,3],'8X ONT ':[1,3],'W5':[8,2],'Amwaj':[0,2],'FTTR':[4,1],'FTTR F50':[6,7],'IFTTR F50 91':[6,7],'IFTTR F50 600':[6,7]};
 const ont=rows.filter(r=>r.source_file==='ONT UPDATE.xlsx'&&config[r.source_sheet]).map(r=>{const [sn,po]=config[r.source_sheet];return {serial_number:String(r.original_cells[sn]??'').trim(),model:r.source_sheet,po_number:String(r.original_cells[po]??'').trim(),source_sheet:r.source_sheet,import_key:r.source_file+':'+r.source_sheet+':'+r.source_row}}).filter(r=>/^[A-Z0-9]{10,}$/i.test(r.serial_number));
 await insert('ont_inventory',ont,Object.keys(ont[0]||{}),'(import_key)');
 console.log(JSON.stringify({history:history.length,staff:staff.length,tickets:tickets.length,orders:orders.length,ont:ont.length,cpe:cpe.length}));
 }catch(e){throw e;}
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>Promise.allSettled([db.end(),...workers.map(client=>client.end())]));
