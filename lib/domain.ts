export const BOOKING_STATUSES = ["requested","dispatching","accepted","driver_en_route","driver_arrived","in_progress","completed","cancelled","no_driver_available"] as const;
export type BookingStatus = typeof BOOKING_STATUSES[number];
export const DRIVER_STATUSES = ["available","busy","unavailable"] as const;
export type DriverStatus = typeof DRIVER_STATUSES[number];
export type DispatchMode = "MANUAL_PRIORITY"|"ROUND_ROBIN"|"FAIRNESS"|"GUARD_PRIORITY";
export interface DriverCandidate { id:string; status:DriverStatus; accountStatus:"active"|"suspended"|"inactive"; priority:number; lastAssignedAt:string|null; onDuty:boolean; acceptsFuture:boolean; accessible:boolean }
export interface DispatchRequest { scheduledFor:string|null; accessible:boolean }
export function selectEligibleDrivers(drivers:DriverCandidate[], request:DispatchRequest){
  const future=Boolean(request.scheduledFor);
  return drivers.filter(d=>d.accountStatus==="active"&&(future?d.acceptsFuture:d.status==="available")&&(!request.accessible||d.accessible)).sort((a,b)=>{
    if(a.onDuty!==b.onDuty)return a.onDuty?-1:1;
    if(a.priority!==b.priority)return a.priority-b.priority;
    return (a.lastAssignedAt||"").localeCompare(b.lastAssignedAt||"");
  });
}
export const STATUS_LABELS:Record<BookingStatus,string>={requested:"Solicitud recibida",dispatching:"Buscando taxi",accepted:"Taxi confirmado",driver_en_route:"Taxista en camino",driver_arrived:"El taxi ha llegado",in_progress:"Servicio en curso",completed:"Servicio finalizado",cancelled:"Cancelado",no_driver_available:"No hay taxis disponibles"};
