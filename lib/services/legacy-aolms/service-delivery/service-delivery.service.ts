import 'server-only';

import { OperationsDatabase } from '../operations-database';
import { dataVerification, crossVerifyOntCheck, buildFinalOutput } from './utils/sd-validation.util';

export class ServiceDeliveryService {
 constructor(private readonly database:OperationsDatabase) {}
 async records(selectedDate?:string) {
  const allRecords=(await this.database.delivery()).filter(r=>r.actioned.toLowerCase()==='delivered');
  const allDates=[...new Set(allRecords.map(r=>r.date).filter(Boolean))].sort().reverse();
  const date=selectedDate||allDates[0]||'';
  const records=allRecords.filter(r=>!date||r.date===date);
  return {records,allRecords,allDates,selectedDate:date,totalDelivered:records.length,sheetName:'Database'};
 }
 async changeDate(date:string){return this.records(date);}
 async dataVerification(date?:string) {
  const [wbs,response]=await Promise.all([this.records(date),this.database.responses()]);
  const results=dataVerification(wbs.records,response);
  return {results,totalRecords:results.length,foundCount:results.filter(r=>r.orderMatch).length,notFoundCount:results.filter(r=>!r.orderMatch).length};
 }
 async crossVerifyOntCheck(date?:string) {
  const [wbs,response]=await Promise.all([this.records(date),this.database.responses()]);
  const inventory=await this.database.inventory(wbs.records.map(r=>r.nceSN),wbs.records.map(r=>r.orderNumber));
  const results=crossVerifyOntCheck(wbs.records,response,inventory.ont,inventory.cpeOrders);
  return {results,totalRecords:results.length,foundInOnt:results.filter(r=>r.foundInOnt).length,needsInvestigation:results.filter(r=>r.status==='Investigate').length,scenarioACount:results.filter(r=>r.scenario==='A').length,scenarioBCount:results.filter(r=>r.scenario==='B').length};
 }
 async finalOutput(){
  const wbs=await this.records();
  const inventory=await this.database.inventory(wbs.allRecords.map(r=>r.nceSN),[]);
  const results=buildFinalOutput(wbs.allRecords,inventory.ont);
  return {results,totalRecords:results.length,totalLabourCharge:results.reduce((n,r)=>n+r.labourCharge,0),totalCpeCharge:results.reduce((n,r)=>n+r.cpeCharge,0),warnings:[...new Set(results.flatMap(r=>r.warnings))]};
 }
 async getStatus(){const [wbs,response]=await Promise.all([this.records(),this.database.responses()]);return {wbsLoaded:true,responseLoaded:true,wbsRecordCount:wbs.totalDelivered,responseRecordCount:response.length,selectedDate:wbs.selectedDate,allDates:wbs.allDates};}
}
