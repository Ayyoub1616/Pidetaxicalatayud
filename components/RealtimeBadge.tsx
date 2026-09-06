"use client";

import {createClient,type RealtimeChannel} from "@supabase/supabase-js";
import {useEffect,useState} from "react";

export default function RealtimeBadge(){const [state,setState]=useState<"demo"|"connecting"|"live"|"offline">(process.env.NEXT_PUBLIC_DEMO_MODE!=="false"?"demo":"connecting");useEffect(()=>{if(process.env.NEXT_PUBLIC_DEMO_MODE!=="false")return;const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key){queueMicrotask(()=>setState("offline"));return}const db=createClient(url,key),channel:RealtimeChannel=db.channel("system-presence");channel.subscribe(status=>setState(status==="SUBSCRIBED"?"live":status==="CHANNEL_ERROR"||status==="TIMED_OUT"?"offline":"connecting"));return()=>{void db.removeChannel(channel)}},[]);const labels={demo:"Demo local",connecting:"Conectando",live:"Sincronizado en directo",offline:"Sin conexión"};return <span className={`realtime-badge ${state}`}><i/>{labels[state]}</span>}
