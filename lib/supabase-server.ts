import {createClient} from "@supabase/supabase-js";
export function getServiceClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("SUPABASE_NOT_CONFIGURED");return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
export async function sha256(value:string){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("")}
export function jsonError(message:string,status:number){return Response.json({error:message},{status})}
