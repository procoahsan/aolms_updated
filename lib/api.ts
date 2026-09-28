import {validateSync} from 'class-validator';
import {CreateAccountDto} from './services/profiles/dto/create-account.dto';
import 'server-only';
import {authenticate,type Actor} from './auth';
import {BadRequestException,HttpException} from './http';
type Context={request:Request;params:Record<string,string>;query:URLSearchParams;actor:Actor};
export function endpoint(roles:string[],run:(context:Context)=>unknown,status=200){
 return async(request:Request,context:{params?:Promise<Record<string,string>>})=>{
  try{
   const actor=roles.length?await authenticate(request,roles):{userId:'',role:''};
   const result=await run({request,params:await context.params||{},query:new URL(request.url).searchParams,actor});
   const headers={'Cache-Control':'no-store'};
   if(result===undefined)return new Response(null,{status,headers});
   if(typeof result==='string')return new Response(result,{status,headers});
   return Response.json(result,{status,headers});
  }catch(error){
   const code=error instanceof HttpException?error.status:500;
   const title:Record<number,string>={400:'Bad Request',401:'Unauthorized',403:'Forbidden',404:'Not Found',409:'Conflict',500:'Internal Server Error'};
   const message=error instanceof HttpException?error.response:'Internal server error';
   if(code===500)console.error('API request failed',error instanceof Error?error.message:'Unknown error');
   return Response.json(typeof message==='object'?{statusCode:code,...message}:{message,error:title[code],statusCode:code},{status:code,headers:{'Cache-Control':'no-store'}});
  }
 };
}
export async function body(request:Request):Promise<any>{try{return await request.json();}catch{throw new BadRequestException('Invalid JSON body');}}
export function integer(value:string){if(!/^-?\d+$/.test(value))throw new BadRequestException('Validation failed (numeric string is expected)');return Number(value);}
export function uuid(value:string){if(!/^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value))throw new BadRequestException('Validation failed (uuid is expected)');return value;}
export async function validateAccount(request:Request){
 const value=await body(request);
 if(!value||typeof value!=='object'||Array.isArray(value))throw new BadRequestException('Account fields are required');
 const instance=Object.assign(new CreateAccountDto(),value);
 const errors=validateSync(instance,{whitelist:true,forbidNonWhitelisted:true});
 if(errors.length)throw new BadRequestException({message:errors.flatMap(e=>Object.values(e.constraints||{})),error:'Bad Request'});
 return instance;
}
