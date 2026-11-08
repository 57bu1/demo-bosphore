"use client";

import { ArrowRight, Plus } from "lucide-react";

import { categories } from "./menu-data";

export default function MenuSection({ onAdd, selected }: { onAdd: (name: string) => void; selected: Record<string, number> }) {
  const count = Object.values(selected).reduce((sum, quantity) => sum + quantity, 0);
  return <section className="menu-section" id="specialites">
    <div className="wrap">
      <div className="menu-heading">
        <div><p className="eyebrow"><span className="line"/> À DÉCOUVRIR</p><h2>Notre <em>menu.</em></h2></div>
        <p>Des sandwichs aux assiettes, trouvez votre envie du moment.</p>
      </div>
      <nav className="menu-jump" aria-label="Catégories du menu">
        {categories.map(category => <a href={`#${category.id}`} key={category.id}>{category.title}</a>)}
      </nav>
      <div className="menu-categories">
        {categories.map(category => <div className="menu-category" id={category.id} key={category.id}>
          <div className="menu-category-title"><span>{category.number} /</span><h3>{category.title}</h3></div>
          <div className="menu-items">{category.items.map(item => <div className="menu-item" key={item.name}><div><strong>{item.name}</strong><small>{item.detail}</small><button className="menu-add" type="button" onClick={() => onAdd(item.name)}><Plus size={14}/> Ajouter{selected[item.name] ? ` · ${selected[item.name]}` : ""}</button></div><span>{item.price}</span></div>)}</div>
        </div>)}
      </div>
      {count > 0 && <div className="menu-selection-bar" role="status"><span>{count} plat{count > 1 ? "s" : ""} ajouté{count > 1 ? "s" : ""} à votre demande</span><a href="#reservation">Continuer la réservation <ArrowRight size={16}/></a></div>}
      <div className="menu-source"><p>Prix et produits affichés sur Uber Eats le 8 novembre 2026. Les tarifs et disponibilités peuvent varier sur place.</p><a href="https://www.ubereats.com/fr/store/le-bosphore/_Frkg62kRmekL4k0BCTIYw" target="_blank" rel="noopener noreferrer">Voir la carte en ligne <ArrowRight size={16}/></a></div>
    </div>
  </section>;
}

