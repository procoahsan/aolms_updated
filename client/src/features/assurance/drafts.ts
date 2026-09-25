// Synchronous writes on every edit survive immediate navigation/refresh.
// Keys include authenticated user, project/ticket, and schema version.
export function readDraft<T>(key:string,fallback:T):T {
  const raw=localStorage.getItem(key);
  if(!raw)return fallback;
  try{return JSON.parse(raw) as T;}catch{throw new Error('Saved draft could not be read. Export browser storage before clearing it.');}
}
export function writeDraft(key:string,value:unknown){localStorage.setItem(key,JSON.stringify(value));}
export function hasConflict(base:number|null,current?:number){return base!==null && base!==current;}
