declare namespace NodeJS {
 interface ProcessEnv {
  NEXT_PUBLIC_SUPABASE_URL?:string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?:string;
  SUPABASE_SECRET_KEY?:string;
  DATABASE_URL?:string;
  DATABASE_POOL_MAX?:string;
  DATABASE_SSL_CA?:string;
  DATABASE_SSL_REJECT_UNAUTHORIZED?:string;
 }
}
