"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CalendarDays, Check, MapPin, Menu, Phone, Users, X } from "lucide-react";
import MenuSection from "./menu";
import SelectedItems from "./selected-items";
import BookingSlotPicker from "./booking-slot-picker";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reference, setReference] = useState("");
  const [reservationError, setReservationError] = useState("");
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const selectedItems = Object.entries(selected).filter(([, quantity]) => quantity > 0);
  function addItem(name: string) { setSelected(current => ({ ...current, [name]: Math.min((current[name] ?? 0) + 1, 20) })); }
  function removeItem(name: string) { setSelected(current => ({ ...current, [name]: Math.max((current[name] ?? 0) - 1, 0) })); }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  async function reserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    setReservationError("");
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), items: selectedItems.map(([name, quantity]) => ({ name, quantity })) }) });
      const result = await response.json() as { error?: string; reference: string };
      if (!response.ok) throw new Error(result.error);
      setReference(result.reference);
      setStatus("done");
      setSelected({});
      form.reset();
    } catch (error) {
      setReservationError(error instanceof Error && error.message ? error.message : "La demande n’a pas pu être envoyée. Veuillez appeler le restaurant.");
      setAvailabilityRefresh(value => value + 1);
      setStatus("error");
    }
  }

  return <main>
    <header className="site-header"><div className="wrap header-inner"><a className="brand" href="#accueil"><span className="brand-mark">B</span><span><strong>LE BOSPHORE</strong><small>BOURGES · RESTAURANT TURC</small></span></a><button className="menu-toggle" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button><nav className={menuOpen ? "nav open" : "nav"} aria-label="Navigation principale"><a href="#specialites" onClick={() => setMenuOpen(false)}>Le menu</a><a href="#infos" onClick={() => setMenuOpen(false)}>Nous trouver</a><a className="nav-book" href="#reservation" onClick={() => setMenuOpen(false)}>Réserver une table <ArrowRight size={16}/></a></nav></div></header>

    <section className="hero" id="accueil"><div className="hero-photo" role="img" aria-label="Illustration d’un sandwich kebab et de frites"/><div className="hero-shade"/><div className="wrap hero-content"><p className="eyebrow light"><span className="line"/> AU CŒUR DE BOURGES</p><h1>Le goût du<br/><em>Bosphore,</em><br/>à Bourges.</h1><p className="hero-copy">Une pause généreuse autour des spécialités turques, à savourer sur place ou à emporter.</p><div className="hero-actions"><a className="button button-primary" href="#reservation">Demander une réservation <ArrowRight size={19}/></a><a className="button button-outline" href="#specialites">Voir le menu</a></div><div className="hero-bottom"><span><MapPin size={17}/> 10 boulevard de la République</span><span><Phone size={17}/> <a href="tel:0248240455">02 48 24 04 55</a></span></div></div></section>

    <MenuSection onAdd={addItem} selected={selected}/>

    <section className="booking-section" id="reservation"><div className="wrap booking-grid"><div className="booking-story"><p className="eyebrow light"><span className="line"/> VOTRE PROCHAINE VISITE</p><h2>On vous garde<br/><em>une place.</em></h2><p>Envoyez votre demande de réservation en quelques secondes. L’équipe du Bosphore vous rappelle pour confirmer la disponibilité.</p><div className="booking-detail"><CalendarDays size={22}/> Choisissez votre date et votre heure</div><div className="booking-detail"><Users size={22}/> Indiquez le nombre de convives</div><div className="booking-detail"><Phone size={22}/> Recevez une confirmation par téléphone</div><p className="booking-caution">Une demande envoyée ne garantit pas une table. Pour aujourd’hui ou une demande urgente, appelez directement le restaurant.</p><a className="booking-phone" href="tel:0248240455"><Phone size={18}/> 02 48 24 04 55</a></div><div className="booking-panel"><div className="panel-top"><span className="panel-icon"><CalendarDays size={25}/></span><div><span className="panel-kicker">RÉSERVATION</span><h3>Demander une table</h3></div></div>{status === "done" ? <div className="success" role="status"><div className="success-icon"><Check size={27}/></div><h4>Demande envoyée</h4><p>Votre demande <strong>#{reference}</strong> a bien été enregistrée. Le restaurant vous rappellera pour confirmer votre table.</p><button type="button" className="button button-primary" onClick={() => setStatus("idle")}>Faire une autre demande</button></div> : <form onSubmit={reserve} className="booking-form"><SelectedItems items={selectedItems} onAdd={addItem} onRemove={removeItem}/><BookingSlotPicker today={today} refreshKey={availabilityRefresh}/><label>Nombre de personnes<select name="guests" defaultValue="" required><option value="" disabled>Choisir le nombre de personnes</option>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1} {i===0 ? "personne" : "personnes"}</option>)}</select></label><div className="form-row"><label>Votre nom<input name="name" type="text" autoComplete="name" placeholder="Votre nom" maxLength={80} required/></label><label>Téléphone<input name="phone" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" maxLength={30} required/></label></div><label>Un détail à nous préciser ? <span className="optional">(facultatif)</span><textarea name="note" placeholder="Une occasion particulière, une demande…" maxLength={500} rows={3}/></label><input name="website" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true"/><button className="button button-primary submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}<ArrowRight size={19}/></button>{status === "error" && <p className="error" role="alert">{reservationError} Appelez le restaurant au 02 48 24 04 55 si besoin.</p>}<p className="form-disclaimer">Vos coordonnées servent uniquement à traiter votre demande de réservation.</p></form>}</div></div></section>

    <section className="visit-section" id="infos"><div className="wrap visit-grid"><div><p className="eyebrow"><span className="line"/> NOUS RENDRE VISITE</p><h2>À deux pas<br/>de <em>vous.</em></h2><p>Retrouvez-nous au 10 boulevard de la République, au centre de Bourges.</p><div className="visit-actions"><a className="button button-dark" href="https://www.google.com/maps/search/?api=1&query=Le+Bosphore+10+Boulevard+de+la+R%C3%A9publique+18000+Bourges" target="_blank" rel="noopener noreferrer">Voir l’itinéraire <ArrowRight size={17}/></a><a className="visit-call" href="tel:0248240455"><Phone size={18}/> Nous appeler</a></div></div><div className="address-card"><div className="address-map"><div className="map-streets"/><span className="map-pin"><MapPin size={27} fill="currentColor"/></span></div><div className="address-bottom"><span className="address-label">LE BOSPHORE · BOURGES</span><strong>10 boulevard de la République<br/>18000 Bourges</strong><a href="tel:0248240455">02 48 24 04 55</a></div></div></div></section>

    <footer><div className="wrap footer-grid"><a className="brand footer-brand" href="#accueil"><span className="brand-mark">B</span><span><strong>LE BOSPHORE</strong><small>BOURGES · RESTAURANT TURC</small></span></a><p>Au plaisir de vous accueillir<br/>à Bourges.</p><div className="footer-links"><a href="#specialites">Menu</a><a href="#reservation">Réservation</a><a href="#infos">Adresse</a></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Le Bosphore</span><span>Visuel culinaire d’illustration.</span></div></footer>
  </main>;
}




