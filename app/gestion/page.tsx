"use client";

import { FormEvent, useState } from "react";

type Reservation = { id: string; name: string; phone: string; date: string; time: string; guests: number; note: string; items: string; status: string; createdAt: string };

function getItems(value: string): { name: string; quantity: number }[] {
  try { const items = JSON.parse(value); return Array.isArray(items) ? items : []; } catch { return []; }
}

export default function Gestion() {
  const [code, setCode] = useState("");
  const [rows, setRows] = useState<Reservation[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(event?: FormEvent) {
    event?.preventDefault(); setBusy(true); setError("");
    try { const response = await fetch("/api/reservations", { headers: { "x-admin-code": code } }); if (!response.ok) throw new Error("Code incorrect ou service indisponible."); const result = await response.json() as { reservations: Reservation[] }; setRows(result.reservations); }
    catch (e) { setError(e instanceof Error ? e.message : "Erreur"); }
    finally { setBusy(false); }
  }
  async function change(id: string, status: string) {
    const response = await fetch("/api/reservations", { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-code": code }, body: JSON.stringify({ id, status }) });
    if (response.ok) setRows(rows => rows?.map(row => row.id === id ? { ...row, status } : row) ?? null);
  }
  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    const response = await fetch(`/api/reservations?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-admin-code": code } });
    if (response.ok) setRows(rows => rows?.filter(row => row.id !== id) ?? null);
  }
  return <main className="admin"><div className="admin-wrap"><a className="admin-back" href="/">← Retour au site</a><div className="admin-heading"><p className="eyebrow"><span className="line"/> LE BOSPHORE</p><h1>Gestion des réservations</h1><p>Consultez les demandes, puis contactez les clients pour confirmer leur table.</p></div><form className="admin-login" onSubmit={load}><label>Code de gestion<input type="password" value={code} onChange={e => setCode(e.target.value)} required autoComplete="off" placeholder="Saisir le code"/></label><button className="button button-primary" disabled={busy}>{busy ? "Chargement…" : "Afficher les demandes"}</button></form>{error && <p className="error" role="alert">{error}</p>}{rows && <div className="admin-list"><div className="admin-list-head"><h2>{rows.length} demande{rows.length !== 1 && "s"}</h2><button onClick={() => load()} className="admin-refresh">Actualiser</button></div>{rows.length === 0 ? <p>Aucune demande pour le moment.</p> : rows.map(row => <article className="admin-card" key={row.id}><div className="admin-card-head"><div><span className="admin-ref">#{row.id.slice(0,8).toUpperCase()}</span><h3>{row.name}</h3></div><span className={`status status-${row.status}`}>{row.status === "confirmed" ? "Confirmée" : row.status === "declined" ? "Refusée" : "À traiter"}</span></div><div className="admin-details"><span>📅 {row.date} à {row.time}</span><span>👥 {row.guests} personne{row.guests > 1 && "s"}</span><a href={`tel:${row.phone}`}>📞 {row.phone}</a></div>{getItems(row.items).length > 0 && <div className="admin-order"><strong>Plats choisis</strong><ul>{getItems(row.items).map(item => <li key={item.name}>{item.quantity} × {item.name}</li>)}</ul></div>}{row.note && <p className="admin-note">{row.note}</p>}<div className="admin-actions"><button onClick={() => change(row.id,"confirmed")}>Marquer confirmée</button><button onClick={() => change(row.id,"declined")}>Marquer refusée</button><button onClick={() => remove(row.id)}>Supprimer</button></div></article>)}</div>}</div></main>;
}

