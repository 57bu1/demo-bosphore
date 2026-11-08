"use client";

import { FormEvent, useEffect, useState } from "react";
import Planning from "./planning";

type Reservation = { id: string; name: string; phone: string; date: string; time: string; guests: number; note: string; items: string; status: string; createdAt: string };

function getItems(value: string): { name: string; quantity: number }[] {
  try { const items = JSON.parse(value); return Array.isArray(items) ? items : []; } catch { return []; }
}

export default function Gestion() {
  const [auth, setAuth] = useState<"checking" | "out" | "in">("checking");
  const [username, setUsername] = useState("lebosphore");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Reservation[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadRows() {
    const response = await fetch("/api/reservations", { cache: "no-store" });
    if (response.status === 401) { setAuth("out"); setRows([]); return; }
    if (!response.ok) { setError("Impossible de charger les réservations."); return; }
    const result = await response.json() as { reservations: Reservation[] };
    setRows(result.reservations);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" }).then(response => response.json()).then((result: { authenticated: boolean }) => {
      if (!active) return;
      setAuth(result.authenticated ? "in" : "out");
      if (result.authenticated) void loadRows();
    }).catch(() => { if (active) setAuth("out"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (auth !== "in") return;
    const interval = setInterval(() => { void loadRows(); }, 5000);
    return () => clearInterval(interval);
  }, [auth]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Connexion impossible.");
      setPassword(""); setAuth("in"); await loadRows();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Connexion impossible."); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuth("out"); setRows([]); setError("");
  }

  async function change(id: string, status: string) {
    const response = await fetch("/api/reservations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (response.ok) { await loadRows(); return; }
    const result = await response.json() as { error?: string };
    setError(result.error || "Modification impossible.");
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    const response = await fetch(`/api/reservations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) await loadRows(); else setError("Suppression impossible.");
  }

  return <main className="admin"><div className="admin-wrap"><a className="admin-back" href="/">← Retour au site</a>
    <div className="admin-heading"><p className="eyebrow"><span className="line"/> LE BOSPHORE</p><h1>Compte du restaurant</h1><p>Planning et réservations à traiter.</p></div>
    {auth === "checking" && <p>Vérification de la connexion…</p>}
    {auth === "out" && <form className="admin-login" onSubmit={login}><label>Identifiant<input type="text" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required /></label><label>Mot de passe<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label><button className="button button-primary" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button></form>}
    {auth === "in" && <><div className="admin-toolbar"><p>Le planning se met à jour automatiquement toutes les 5 secondes.</p><button onClick={logout}>Se déconnecter</button></div><Planning reservations={rows}/><div className="admin-list"><div className="admin-list-head"><h2>{rows.length} demande{rows.length !== 1 && "s"}</h2><button onClick={() => void loadRows()} className="admin-refresh">Actualiser</button></div>{rows.length === 0 ? <p>Aucune demande pour le moment.</p> : rows.map(row => <article className="admin-card" key={row.id}><div className="admin-card-head"><div><span className="admin-ref">#{row.id.slice(0,8).toUpperCase()}</span><h3>{row.name}</h3></div><span className={`status status-${row.status}`}>{row.status === "confirmed" ? "Confirmée" : row.status === "declined" ? "Refusée" : "À traiter"}</span></div><div className="admin-details"><span>📅 {row.date} à {row.time}</span><span>👥 {row.guests} personne{row.guests > 1 && "s"}</span><a href={`tel:${row.phone}`}>📞 {row.phone}</a></div>{getItems(row.items).length > 0 && <div className="admin-order"><strong>Plats choisis</strong><ul>{getItems(row.items).map(item => <li key={item.name}>{item.quantity} × {item.name}</li>)}</ul></div>}{row.note && <p className="admin-note">{row.note}</p>}<div className="admin-actions"><button onClick={() => void change(row.id,"confirmed")}>Marquer confirmée</button><button onClick={() => void change(row.id,"declined")}>Marquer refusée</button><button onClick={() => void remove(row.id)}>Supprimer</button></div></article>)}</div></>}
    {error && <p className="error admin-error" role="alert">{error}</p>}
  </div></main>;
}
