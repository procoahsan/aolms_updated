import 'server-only';
import { Pool, type PoolClient } from 'pg';
import { attachDatabasePool } from '@vercel/functions';

const globalDb=globalThis as typeof globalThis & {aolmsPool?:Pool};
export function getPool(){
 if(!globalDb.aolmsPool){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
  globalDb.aolmsPool=new Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DATABASE_POOL_MAX||4),idleTimeoutMillis:5000,connectionTimeoutMillis:15000,
   ssl:process.env.DATABASE_SSL_CA?{ca:process.env.DATABASE_SSL_CA.replace(/\\n/g,'\n'),rejectUnauthorized:true}:{rejectUnauthorized:process.env.DATABASE_SSL_REJECT_UNAUTHORIZED!=='false'}});
  attachDatabasePool(globalDb.aolmsPool);
  globalDb.aolmsPool.on('error',error=>console.error('Idle database connection failed',error.message));
 }
 return globalDb.aolmsPool;
}
export class Database {
 constructor(private client?:PoolClient){}
 async query(sql:string,values?:any[]):Promise<any[]>{return (await (this.client||getPool()).query(sql,values)).rows;}
 async transaction<T>(work:(db:Database)=>Promise<T>):Promise<T>{
  const client=await getPool().connect();
  try{await client.query('BEGIN');const result=await work(new Database(client));await client.query('COMMIT');return result;}
  catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 }
}
export const db=new Database();
