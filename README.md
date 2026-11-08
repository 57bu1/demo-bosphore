# Le Bosphore — Bourges

Site Next/Vinext avec formulaire de demande de réservation, base Cloudflare D1 et tableau de gestion.

## Fichiers à copier

- `app/page.tsx` : page d'accueil et formulaire.
- `app/globals.css` : styles responsives.
- `app/layout.tsx` : métadonnées et langue.
- `app/api/reservations/route.ts` : création et gestion des demandes.
- `app/gestion/page.tsx` : tableau de gestion.
- `db/schema.ts` : structure de la base de données.
- `public/hero-kebab.png` : visuel d'illustration généré pour ce projet.
- `.openai/hosting.json` : configuration Sites et base D1.

Le formulaire est une **demande** : la réservation n'est confirmée qu'après un appel du restaurant. Les demandes sont stockées dans D1 et consultables sur `/gestion` avec le code secret configuré dans la variable d'environnement `RESERVATION_ADMIN_CODE`.

Pour lancer localement après installation des dépendances : `npm run dev`. Pour créer une migration après un changement de schéma : `npm run db:generate`.

Coordonnées utilisées : 10 boulevard de la République, 18000 Bourges ; 02 48 24 04 55. Confirmer les textes et les horaires avec le restaurant avant une diffusion publique.
