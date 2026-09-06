"use client";

import Link from "next/link";
import {useState} from "react";

const initialDrivers = [
  {name: "Carlos Martín", status: "available", duty: true},
  {name: "Antonio López", status: "available", duty: false},
  {name: "Mohamed Amrani", status: "busy", duty: false},
  {name: "Javier Ruiz", status: "unavailable", duty: false},
  {name: "Pedro Sánchez", status: "available", duty: false},
];

const navigation = [
  ["▦", "Control", "/admin"], ["↗", "Servicios", "/admin/servicios"],
  ["✉", "Solicitudes alta", "/admin/solicitudes-taxistas"], ["●", "Taxistas", "/admin/taxistas"],
  ["□", "Guardias", "/admin/guardias"], ["☆", "Valoraciones", "/admin/valoraciones"],
  ["!", "Incidencias", "/admin/incidencias"], ["↗", "Estadísticas", "/admin/estadisticas"],
  ["⚙", "Configuración", "/admin/configuracion"],
];

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [notice, setNotice] = useState("");
  const rotate = () => { setDrivers((current) => [...current.slice(1), current[0]]); setNotice("Orden de reparto actualizado"); };
  return <div className="admin"><aside><div className="admin-brand"><span>PT</span><strong>PideTaxi<em>Calatayud</em><small>Administración</small></strong></div><nav>{navigation.map(([icon, name, href], index) => <Link className={index === 0 ? "active" : ""} href={href} key={name}><i>{icon}</i>{name}</Link>)}</nav><div className="admin-user"><span>AD</span><div><strong>Administrador</strong><small>admin@pidetaxi.es</small></div></div></aside><main><header><div><span className="section-kicker">Domingo, 6 septiembre</span><h1>Control</h1></div><div className="quick-actions"><button onClick={() => setNotice("Servicio manual listo para completar")}>+ Servicio manual</button><button onClick={() => setNotice("Nueva guardia lista para programar")}>+ Guardia</button><Link className="admin-primary-link" href="/admin/solicitudes-taxistas">Ver solicitudes</Link></div></header>{notice && <div className="admin-notice">✓ {notice}<button onClick={() => setNotice("")}>×</button></div>}<section className="metrics">{[["Servicios hoy", "18", "+3 vs. ayer"], ["Aceptados", "16", "88,9%"], ["Finalizados", "12", "4 en curso"], ["Solicitudes alta", "2", "Pendientes de revisar"]].map(([label, value, detail]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</section><div className="admin-grid"><section className="panel duty-panel"><header><div><span className="panel-kicker">Guardia ahora</span><h2>Carlos Martín</h2></div><span className="pill green">● Disponible</span></header><p>Hoy, 14:00 — 22:00</p><div className="alert-soft">✓ Guardia cubierta correctamente</div></section><section className="panel active-panel"><header><div><span className="panel-kicker">Servicios activos</span><h2>4 en curso</h2></div><Link href="/admin/servicios">Ver todos →</Link></header>{[["#1048", "AVE Calatayud", "Hospital Ernest Lluch", "Carlos", "En camino"], ["#1047", "Paseo Cortes", "Zaragoza", "Mohamed", "En servicio"], ["#1046", "Plaza España", "Estación AVE", "Antonio", "Ha llegado"]].map((row) => <div className="service-row" key={row[0]}><small>{row[0]}</small><div><strong>{row[1]} → {row[2]}</strong><span>{row[3]}</span></div><b>{row[4]}</b></div>)}</section><section className="panel taxis-panel"><header><div><span className="panel-kicker">Taxis</span><h2>Orden de reparto</h2></div><button onClick={rotate}>Cambiar orden</button></header>{drivers.map((driver, index) => <div className="taxi-row" key={driver.name}><i>≡</i><span className="order">{index + 1}</span><div><strong>{driver.name}</strong><small>{driver.duty ? "De guardia" : "Sin guardia"}</small></div><span className={`status ${driver.status}`}>● {driver.status === "available" ? "Disponible" : driver.status === "busy" ? "En servicio" : "No disponible"}</span></div>)}</section><section className="panel bookings-panel"><header><div><span className="panel-kicker">Reservas próximas</span><h2>Hoy y mañana</h2></div><span>6 reservas</span></header>{[["19:30", "Hotel Fornos", "Estación AVE", "Antonio"], ["Mañana 07:00", "Calatayud", "Aeropuerto Zaragoza", "Carlos"], ["Mañana 09:15", "Hospital", "Centro", "Por asignar"]].map((row) => <div className="booking-row" key={row[0]}><strong>{row[0]}</strong><div>{row[1]} → {row[2]}<small>{row[3]}</small></div></div>)}</section></div></main></div>;
}
