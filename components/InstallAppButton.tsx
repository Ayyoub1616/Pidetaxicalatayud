"use client";

import {useEffect,useState} from "react";

type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};

export default function InstallAppButton({label="Instalar aplicación"}:{label?:string}){const [prompt,setPrompt]=useState<InstallPrompt|null>(null),[installed,setInstalled]=useState(false);useEffect(()=>{const ready=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt)};const complete=()=>setInstalled(true);window.addEventListener("beforeinstallprompt",ready);window.addEventListener("appinstalled",complete);queueMicrotask(()=>setInstalled(window.matchMedia("(display-mode: standalone)").matches));return()=>{window.removeEventListener("beforeinstallprompt",ready);window.removeEventListener("appinstalled",complete)}},[]);async function install(){if(!prompt){setInstalled(window.matchMedia("(display-mode: standalone)").matches);return}await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==="accepted")setInstalled(true);setPrompt(null)}return <button className="button primary install-button" onClick={install} disabled={installed}>{installed?"Aplicación instalada":prompt?label:"Abrir opciones de instalación"}</button>}
