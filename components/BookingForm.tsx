"use client";
import {useEffect,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {saveDemoBooking} from "../lib/demo";

export default function BookingForm(){
  const params=useSearchParams(),router=useRouter();
  const [type,setType]=useState<"now"|"scheduled">(params.get("tipo")==="reserva"?"scheduled":"now");
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>{const key=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;if(!key)return;const form=document.querySelector(".booking-form");if(!form||document.querySelector(".cf-turnstile"))return;const widget=document.createElement("div");widget.className="cf-turnstile";widget.dataset.sitekey=key;form.insertBefore(widget,form.lastElementChild);const script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js";script.async=true;document.head.appendChild(script);return()=>{script.remove()}},[]);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");const data=new FormData(e.currentTarget),phone=String(data.get("phone"));
    if(!/^(?:\+34)?[6-9]\d{8}$/.test(phone.replace(/[\s-]/g,""))){setError("Revisa el número de teléfono.");return}
    setBusy(true);const draft={type,pickup:String(data.get("pickup")),destination:String(data.get("destination")),passengers:String(data.get("passengers")),name:String(data.get("name")),phone,email:String(data.get("email")||""),notes:String(data.get("notes")||""),accessible:data.get("accessible")==="yes",scheduledAt:type==="scheduled"?new Date(`${data.get("date")}T${data.get("time")}`).toISOString():undefined,turnstileToken:String(data.get("cf-turnstile-response")||""),website:String(data.get("website")||"")};
    try{if(process.env.NEXT_PUBLIC_DEMO_MODE!=="false"){const token=crypto.randomUUID().replaceAll("-","");saveDemoBooking({...draft,token,status:"dispatching",createdAt:new Date().toISOString()});router.push(`/reserva/${token}`);return}const response=await fetch("/api/bookings",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(draft)}),result=await response.json() as {publicToken?:string;error?:string};if(!response.ok||!result.publicToken)throw new Error(result.error||"No se ha podido enviar");router.push(`/reserva/${result.publicToken}`)}catch(err){setError(err instanceof Error?err.message:"No se ha podido enviar la solicitud");setBusy(false)}
  }
  function locate(){if(!navigator.geolocation){setError("Tu navegador no permite obtener la ubicación.");return}navigator.geolocation.getCurrentPosition(()=>{const el=document.querySelector<HTMLInputElement>("#pickup");if(el)el.value="Mi ubicación actual (GPS guardado)"},()=>setError("No hemos podido obtener tu ubicación. Puedes escribirla."))}
  return <form className="booking-form" onSubmit={submit}>
    <div className="segmented"><button type="button" className={type==="now"?"active":""} onClick={()=>setType("now")}>Ahora</button><button type="button" className={type==="scheduled"?"active":""} onClick={()=>setType("scheduled")}>Reservar</button></div>
    {type==="scheduled"&&<div className="field-row"><label>Fecha<input name="date" type="date" required/></label><label>Hora<input name="time" type="time" required/></label></div>}
    <label>¿Dónde te recogemos?<input id="pickup" name="pickup" placeholder="Calle, número o lugar" required/></label><button className="location-button" type="button" onClick={locate}>◎ Usar mi ubicación</button>
    <label>¿A dónde vas?<input name="destination" placeholder="Destino" required/></label>
    <fieldset><legend>Personas</legend><div className="people">{["1","2","3","4","5+"].map((n,i)=><label key={n}><input type="radio" name="passengers" value={n} defaultChecked={i===0}/><span>{n}</span></label>)}</div></fieldset>
    <div className="field-row"><label>Nombre<input name="name" autoComplete="name" required/></label><label>Teléfono<input name="phone" type="tel" inputMode="tel" placeholder="600 000 000" autoComplete="tel" required/></label></div>
    <label>Email <small>Opcional</small><input name="email" type="email" autoComplete="email"/></label><label>Información para el taxista <small>Opcional</small><textarea name="notes" placeholder="Ej.: Estoy en la puerta de la estación. Voy con dos maletas." rows={3}/></label>
    <fieldset><legend>¿Necesitas taxi adaptado?</legend><div className="inline-radios"><label><input type="radio" name="accessible" value="no" defaultChecked/> No</label><label><input type="radio" name="accessible" value="yes"/> Sí</label></div></fieldset>
    <input className="honeypot" name="website" tabIndex={-1} autoComplete="off"/><p className="form-note">Al solicitar, avisaremos a taxistas disponibles. Tu taxi queda confirmado únicamente cuando uno acepte.</p>{error&&<p className="error" role="alert">{error}</p>}<button className="submit-button" disabled={busy}>{busy?"Enviando…":type==="now"?"Solicitar taxi":"Reservar taxi"}</button>
  </form>
}
