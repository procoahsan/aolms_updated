// Existing update DTOs retain their base shape. PATCH handlers preserve the
// original optional-field semantics; account creation is explicitly validated.
export function PartialType<T extends new (...args:any[])=>any>(Base:T){return Base;}
