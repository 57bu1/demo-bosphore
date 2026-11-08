# Le Bosphore — Bourges

Site Next/Vinext avec formulaire de demande de réservation, base Cloudflare D1 et tableau de gestion.

**Pour installer le code sur votre propre compte : [guide pas à pas](INSTALLATION.md).**

## Fichiers à copier

- `app/page.tsx` : page d'accueil et formulaire.
- `app/menu.tsx`, `app/menu-data.ts` : vraie carte et sélection des plats.
- `app/selected-items.tsx` : plats choisis dans la demande de réservation.
- `app/globals.css` : styles responsives.
- `app/layout.tsx` : métadonnées et langue.
- `app/api/reservations/route.ts` : création et gestion des demandes.
- `app/gestion/page.tsx` : connexion du compte restaurant et tableau de gestion.
- `app/gestion/planning.tsx` : planning quotidien des réservations.
- `app/booking-slot-picker.tsx`, `app/booking-slots.ts` : choix des heures disponibles.
- `db/schema.ts` : structure de la base de données.
- `public/hero-kebab.png` : visuel d'illustration généré pour ce projet.
- `.openai/hosting.json` : configuration Sites et base D1.

Le formulaire est une **demande** : la réservation n'est confirmée qu'après un appel du restaurant. Les demandes sont stockées dans D1 et consultables sur `/gestion` avec le compte restaurant (identifiant `lebosphore`, mot de passe dans la variable secrète `RESERVATION_ADMIN_CODE`). Le mot de passe ne doit jamais être commité.

Une seule demande active est acceptée par date et par heure. Un créneau refusé ou supprimé redevient disponible. Le planning du restaurant se rafraîchit toutes les 5 secondes.

La carte et ses prix sont repris de la fiche Uber Eats du Bosphore à Bourges consultée le 8 novembre 2026. Les prix sur place peuvent différer.

Pour lancer localement après installation des dépendances : `npm run dev`. Pour créer une migration après un changement de schéma : `npm run db:generate`.

Coordonnées utilisées : 10 boulevard de la République, 18000 Bourges ; 02 48 24 04 55. Confirmer les textes et les horaires avec le restaurant avant une diffusion publique.
