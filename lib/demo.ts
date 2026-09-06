import type { BookingStatus } from "./domain";
export interface DemoBooking {token:string;type:"now"|"scheduled";pickup:string;destination:string;passengers:string;name:string;phone:string;email?:string;notes?:string;accessible:boolean;scheduledAt?:string;status:BookingStatus;createdAt:string}
const KEY="ptc_demo_bookings";
export function saveDemoBooking(booking:DemoBooking){if(typeof window==="undefined")return;const current=JSON.parse(localStorage.getItem(KEY)||"{}");current[booking.token]=booking;localStorage.setItem(KEY,JSON.stringify(current))}
export function getDemoBooking(token:string):DemoBooking|null{if(typeof window==="undefined")return null;return JSON.parse(localStorage.getItem(KEY)||"{}")[token]||null}
export function updateDemoBooking(token:string,status:BookingStatus){const booking=getDemoBooking(token);if(booking){booking.status=status;saveDemoBooking(booking)}return booking}
