import 'server-only';

import { OperationsDatabase, str, day } from '../operations-database';

export class LogisticsService {
 constructor(private readonly database:OperationsDatabase) {}
 async records(selectedDate?:string){
  const dates=await this.database.db.query('SELECT DISTINCT work_date::text AS date FROM assurance_tickets WHERE work_date IS NOT NULL ORDER BY date DESC');
  const allDates=dates.map((r:any)=>r.date);const date=selectedDate||allDates[1]||allDates[0]||'';
  const rows:any[]=await this.database.db.query(`SELECT t.*,to_jsonb(s) submission FROM assurance_tickets t LEFT JOIN LATERAL (SELECT * FROM assurance_submissions WHERE ticket_id=t.id AND status='submitted' ORDER BY submitted_at DESC LIMIT 1) s ON true WHERE ($1='' OR t.work_date::text=$1) ORDER BY t.ticket_number`,[date]);
  const team=await this.database.history('team');
  const teamMap=new Map(team.filter(r=>!date||day(r.work_date)===date).map(r=>[str(r.data,'sr ticket number','ticket number','ticket no'),r.data]));
  const records=rows.map((t:any,i:number)=>{const d=t.legacy_data||{},s=t.submission||{},response:any=teamMap.get(str(t,'ticket_number'));const found=!!t.submission||!!response;return {id:i+1,date:day(t.work_date),team:str(t,'team'),package:str(t,'package'),exchange:str(t,'exchange'),block:str(t,'block'),road:str(t,'road'),colI:str(t,'building'),flat:str(t,'flat'),loName:str(t,'lo_name'),ticketNo:str(t,'ticket_number'),status:str(t,'status'),rootCause:str(s,'root_cause')||str(d,'root cause'),resolution:str(s,'resolution')||str(d,'resolution list'),resolutionDesc:str(s,'resolution_description')||str(d,'resolution description'),faultyDamaged:str(d,'faulty damaged'),ont:str(s,'new_cpe_model')||str(d,'ont model'),snOldOnt:str(s,'replaced_cpe_sn')||str(d,'sn old ont'),newSnNo:str(s,'new_cpe_sn')||str(d,'new sn no as per nce'),ontProtectionBox:str(s,'ont_protection_box')||str(d,'ont protection box'),finalRemarksAnisa:str(d,'final remarks anisa'),teamSheetFound:found,isMatch:found,teamName:str(response,'team name'),teamOnt:str(response,'replaced ont'),teamOldSn:str(response,'old ont serial no'),teamNewSn:str(response,'new ont serial no'),teamOntBox:str(response,'fiber termination box ftb'),remarks:found?[]:['No technician response found']};}).filter(r=>!r.finalRemarksAnisa.toLowerCase().includes('not required'));
  return {success:true,data:records,allDates,availableDates:allDates.map((d:string)=>({label:d,value:d})),selectedDate:date};
 }
 async changeDate(date:string){return this.records(date);}
 async checkOntSerials(date?:string){const result=await this.records(date);const inventory=await this.database.inventory(result.data.map(r=>r.newSnNo),[]);return [...new Set(result.data.map(r=>r.newSnNo).filter(Boolean))].map(serial=>{const found=inventory.ont.get(serial.toUpperCase());return {serialNumber:serial,poNumber:found?.poNumber||'Not Found',ontName:found?.assetDescription||''}});}
}
