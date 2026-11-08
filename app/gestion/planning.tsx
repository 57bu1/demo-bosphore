"use client";

import { useState } from "react";
import { bookingSlots, parisNow } from "../booking-slots";

type PlanningReservation = { id: string; name: string; phone: string; date: string; time: string; guests: number; status: string };

export default function Planning({ reservations }: { reservations: PlanningReservation[] }) {
  const [date, setDate] = useState(parisNow().date);
  const booked = reservations.filter(row => row.date === date && row.status !== "declined");
  const displayDate = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(new Date(`${date}T12:00:00Z`));

  return <section className="planning" aria-label="Planning des réservations"><div className="planning-head"><div><span className="panel-kicker">PLANNING</span><h2>{displayDate}</h2><p>{booked.length} créneau{booked.length > 1 ? "x" : ""} réservé{booked.length > 1 ? "s" : ""}</p></div><label>Voir une date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label></div><div className="planning-slots">{bookingSlots.map(time => {
    const row = booked.find(item => item.time === time);
    return <div className={`planning-slot ${row ? "planning-slot-booked" : ""}`} key={time}><strong>{time}</strong>{row ? <div><span className="planning-badge">{row.status === "confirmed" ? "Confirmée" : "À confirmer"}</span><span>{row.name} · {row.guests} personne{row.guests > 1 ? "s" : ""}</span><a href={`tel:${row.phone}`}>{row.phone}</a></div> : <span className="planning-free">Disponible</span>}</div>;
  })}</div></section>;
}
