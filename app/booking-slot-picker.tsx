"use client";

import { useEffect, useState } from "react";

type Slot = { time: string; available: boolean };

export default function BookingSlotPicker({ today, refreshKey }: { today: string; refreshKey: number }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!date) { setSlots([]); return; }
    let active = true;
    async function refresh() {
      setLoading(true);
      try {
        const response = await fetch(`/api/availability?date=${encodeURIComponent(date)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Disponibilités indisponibles");
        const result = await response.json() as { slots: Slot[] };
        if (!active) return;
        setSlots(result.slots);
        setTime(current => result.slots.some(slot => slot.time === current && slot.available) ? current : "");
        setError(false);
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }
    void refresh();
    const interval = setInterval(() => { void refresh(); }, 15000);
    return () => { active = false; clearInterval(interval); };
  }, [date, refreshKey]);

  const availableCount = slots.filter(slot => slot.available).length;
  return <div className="form-row">
    <label>Date souhaitée<input name="date" type="date" min={today} value={date} onChange={event => { setDate(event.target.value); setTime(""); }} required /></label>
    <label>Heure disponible<select name="time" value={time} onChange={event => setTime(event.target.value)} disabled={!date || loading || error} required>
      <option value="">{!date ? "Choisissez d’abord la date" : loading ? "Chargement…" : "Choisir une heure"}</option>
      {slots.map(slot => <option key={slot.time} value={slot.time} disabled={!slot.available}>{slot.time}{slot.available ? "" : " · réservé"}</option>)}
    </select></label>
    {date && !loading && !error && <p className="slot-feedback" role="status">{availableCount ? `${availableCount} créneau${availableCount > 1 ? "x" : ""} disponible${availableCount > 1 ? "s" : ""} ce jour` : "Tous les créneaux sont réservés pour cette date."}</p>}
    {error && <p className="slot-feedback slot-error" role="alert">Impossible de charger les disponibilités. Réessayez avec une autre date ou appelez le restaurant.</p>}
  </div>;
}
