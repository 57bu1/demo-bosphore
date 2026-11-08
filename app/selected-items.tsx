export default function SelectedItems({ items, onAdd, onRemove }: { items: [string, number][]; onAdd: (name: string) => void; onRemove: (name: string) => void }) {
  return <div className="booking-order">
    <div className="booking-order-head"><strong>Votre choix dans la carte</strong><span>Facultatif</span></div>
    {items.length === 0 ? <p>Vous pouvez <a href="#specialites">choisir des plats dans le menu</a> avant d’envoyer votre demande.</p> : <>
      <p>Les plats sélectionnés seront transmis avec votre demande. Le restaurant confirmera leur disponibilité.</p>
      <div className="booking-order-list">{items.map(([name, quantity]) => <div className="booking-order-item" key={name}><span>{name}</span><div className="quantity-controls"><button type="button" onClick={() => onRemove(name)} aria-label={`Retirer un ${name}`}>−</button><output>{quantity}</output><button type="button" onClick={() => onAdd(name)} aria-label={`Ajouter un ${name}`}>+</button></div></div>)}</div>
      <a className="order-more" href="#specialites">Ajouter d’autres plats</a>
    </>}
  </div>;
}
