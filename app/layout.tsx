import type { Metadata } from "next";
import "./globals.css";
import "./app.css";
import "./professional.css";
import "./professional-extras.css";
import PwaRegister from "../components/PwaRegister";
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://pidetaxicalatayud.es"),title:"Taxi Calatayud | Pedir taxi o reservar | PideTaxiCalatayud",description:"Pide taxi en Calatayud desde una sola web. Avisamos a taxistas disponibles y te confirmamos cuando uno acepte.",alternates:{canonical:"/"},manifest:"/manifest.webmanifest",icons:{icon:[{url:"/icon-192.png",sizes:"192x192",type:"image/png"}]},openGraph:{title:"Pide taxi en Calatayud",description:"Solicita o reserva un taxi desde el móvil.",type:"website",locale:"es_ES",images:[{url:"/og.png",width:1200,height:630,alt:"Pide taxi en Calatayud"}]},twitter:{card:"summary_large_image",title:"Pide taxi en Calatayud",description:"Rápido, sencillo y sin llamadas",images:["/og.png"]}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body>{children}<PwaRegister/></body></html>}
