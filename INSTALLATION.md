# Installer Le Bosphore avec le code source

Ce guide s'adresse à la personne qui récupère le code et veut mettre le site en ligne sur **son propre compte Cloudflare**. Il utilise GitHub pour récupérer les fichiers, puis Cloudflare Workers et D1 pour héberger le site et les réservations. Les commandes ci-dessous sont à lancer dans PowerShell sous Windows. Sur Mac ou Linux, les commandes `npm`, `npx` et `git` sont les mêmes ; ouvrez simplement un terminal.

## 1. Ce que contient le projet

- Une page d'accueil responsive, une carte et un formulaire de demande de réservation.
- Un choix de date et d'heure : une seule demande active est acceptée par créneau. Une demande refusée ou supprimée libère le créneau.
- Une page `/gestion` pour le restaurant, avec connexion, liste des demandes et planning mis à jour automatiquement.
- Une base Cloudflare D1 qui conserve les demandes.

**À savoir :** le client envoie une *demande*. Le restaurant doit encore appeler le client pour la confirmer. Le site n'envoie pas de SMS ou d'e-mail. Le code source ne contient ni les réservations déjà reçues, ni le mot de passe du site actuellement en ligne.

## 2. Préparer les comptes et les outils

1. Créez ou utilisez un [compte GitHub](https://github.com/) pour conserver votre copie du code.
2. Créez un [compte Cloudflare](https://dash.cloudflare.com/sign-up) pour héberger le site et la base D1.
3. Installez [Node.js](https://nodejs.org/) **version 22.13 ou supérieure** et [Git](https://git-scm.com/downloads).
4. Vérifiez dans PowerShell :

```powershell
node --version
npm --version
git --version
```

## 3. Récupérer et personnaliser le code

Si vous avez reçu un ZIP, décompressez-le et ouvrez PowerShell dans le dossier contenant `package.json`. Si vous partez du dépôt GitHub :

```powershell
git clone https://github.com/57bu1/demo-bosphore.git
cd demo-bosphore
npm ci
```

Pour créer votre propre dépôt GitHub, créez d'abord un dépôt vide dans votre compte, puis changez l'adresse du dépôt distant et envoyez le code :

```powershell
git remote set-url origin https://github.com/VOTRE_COMPTE/VOTRE_DEPOT.git
git push -u origin main
```

Si le dépôt récupéré n'a pas de remote nommé `origin`, utilisez `git remote add origin https://github.com/VOTRE_COMPTE/VOTRE_DEPOT.git` à sa place. Un dépôt **privé** évite que tout le monde puisse télécharger votre copie du code.

Avant la mise en ligne, vérifiez et modifiez ces fichiers selon les informations validées par le restaurant :

| Fichier | À modifier |
| --- | --- |
| `app/page.tsx`, `app/layout.tsx` | Textes, coordonnées et titre du site |
| `app/menu-data.ts` | Plats et prix ; vérifiez-les avec le restaurant |
| `app/booking-slots.ts` | Heures proposées et règles de date |
| `app/admin-auth.ts` | Identifiant du restaurant (`restaurantUsername`, actuellement `lebosphore`) |
| `public/hero-kebab.png` | Image d'accueil si vous souhaitez la remplacer |

Pour choisir un autre identifiant, modifiez la valeur de `restaurantUsername` dans `app/admin-auth.ts` **avant** de construire le site. Le mot de passe se configure plus loin et ne doit pas être écrit dans ce fichier.

Le fichier `.openai/hosting.json` appartient à l'hébergement Sites d'origine. **Vous n'avez pas besoin de son `project_id`** pour publier sur votre propre compte Cloudflare avec les étapes ci-dessous.

## 4. Créer la base de réservations

Connectez l'outil Cloudflare à votre compte, puis créez une base neuve :

```powershell
npx wrangler login
npx wrangler d1 create le-bosphore-reservations
```

Gardez le `database_id` (identifiant UUID) affiché par la deuxième commande. Cloudflare crée une base vide : les données de l'ancien site n'y seront pas copiées.

Dans le dossier du projet, appliquez **dans cet ordre** les trois fichiers SQL à la nouvelle base :

```powershell
npx wrangler d1 execute le-bosphore-reservations --remote --file=drizzle/0000_abnormal_marvel_zombies.sql
npx wrangler d1 execute le-bosphore-reservations --remote --file=drizzle/0001_blue_aaron_stack.sql
npx wrangler d1 execute le-bosphore-reservations --remote --file=drizzle/0002_glamorous_boom_boom.sql
```

Confirmez chaque commande si Cloudflare vous le demande. Le dernier fichier crée la règle qui empêche deux demandes actives à la même date et à la même heure. **N'exécutez ces trois fichiers qu'une seule fois sur une base neuve** : les relancer sur une base déjà initialisée produirait des erreurs de table, colonne ou index existant.

## 5. Construire le site et relier la base

Depuis le dossier du projet :

```powershell
npm run build
```

Ouvrez ensuite `dist/server/wrangler.json` dans un éditeur de texte. Ce fichier est généré automatiquement. Changez les valeurs suivantes :

```json
"name": "le-bosphore-bourges",
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "le-bosphore-reservations",
    "database_id": "UUID_AFFICHE_PAR_D1_CREATE"
  }
]
```

Ce bloc montre les **valeurs à remplacer dans le JSON existant**, pas un fichier JSON complet à coller. Gardez tout le reste du fichier tel quel, notamment `main`, `assets` et `compatibility_flags`. Le nom du Worker doit être disponible dans votre compte Cloudflare ; choisissez-en un autre si nécessaire. Le binding doit s'appeler exactement `DB`.

> **À chaque modification du code :** relancez `npm run build`, puis remettez ces trois valeurs dans `dist/server/wrangler.json` avant de redéployer. Le build recrée ce fichier avec un identifiant de base fictif.

## 6. Mettre en ligne et créer le compte restaurant

Déployez depuis le dossier du projet :

```powershell
npx wrangler deploy --config dist/server/wrangler.json
```

Cloudflare affiche une adresse du type `https://le-bosphore-bourges.VOTRE_COMPTE.workers.dev`. Ouvrez cette adresse pour voir le site.

Créez ensuite un **nouveau mot de passe long et unique** pour le restaurant :

```powershell
npx wrangler secret put RESERVATION_ADMIN_CODE --config dist/server/wrangler.json
```

Saisissez le mot de passe lorsque l'outil le demande. La saisie n'apparaît pas à l'écran. Ne le mettez jamais dans GitHub, dans le guide, dans `.env` commité ou dans le code. L'identifiant est celui défini dans `app/admin-auth.ts` (`lebosphore` tant que vous ne le changez pas). La page de connexion est :

```text
https://VOTRE_ADRESSE/gestion
```

Si vous changez le mot de passe plus tard, relancez `npx wrangler secret put RESERVATION_ADMIN_CODE --config dist/server/wrangler.json`. Les connexions déjà ouvertes cesseront de fonctionner.

Vous pouvez [ajouter un domaine personnalisé](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) depuis Cloudflare quand le site fonctionne sur `workers.dev`.

## 7. Vérifier avant de transmettre au restaurant

1. Ouvrez le site sur téléphone et ordinateur. Vérifiez la carte, les prix, l'adresse et le numéro.
2. Envoyez une **demande de test** pour une date future et une heure disponible.
3. Ouvrez `/gestion`, connectez-vous, vérifiez que la demande apparaît au planning, puis marquez-la confirmée ou refusée.
4. Essayez la même date et la même heure depuis une autre fenêtre : une demande active doit bloquer le créneau. Si vous avez marqué la première demande refusée, le créneau doit redevenir disponible.
5. Supprimez la demande de test dans `/gestion` si elle ne doit pas rester dans la base.

## 8. Mettre le site à jour

Après avoir changé le code ou la carte :

```powershell
npm run build
```

Remettez le vrai nom du Worker, le nom de la base et son UUID dans `dist/server/wrangler.json`, comme à l'étape 5, puis :

```powershell
npx wrangler deploy --config dist/server/wrangler.json
```

Pour enregistrer vos modifications de code dans **votre** GitHub :

```powershell
git add .
git commit -m "Mise a jour du site"
git push
```

Le dossier `dist/`, les fichiers de mot de passe et la base de données ne sont pas envoyés sur GitHub. Changer le schéma de la base plus tard demande une nouvelle migration SQL ; `npm run db:generate` peut en créer une, mais il faut ensuite l'appliquer à la base distante.

## En cas de problème

| Problème | Vérification |
| --- | --- |
| « Service indisponible » lors d'une réservation | Vérifiez les trois fichiers SQL et le binding `DB` avec le bon `database_id`. |
| Connexion impossible sur `/gestion` | Vérifiez l'identifiant dans `app/admin-auth.ts`, puis recréez le secret `RESERVATION_ADMIN_CODE`. |
| `database_id` vaut `00000000-0000-4000-8000-000000000000` | C'est l'ID fictif du développement local : remplacez-le dans `dist/server/wrangler.json`. |
| Les changements ne sont pas visibles | Relancez le build, recorrigez le fichier Wrangler généré et redéployez. |
| Le planning est vide après migration | Une nouvelle base est vide ; les anciennes réservations ne sont pas dans le dépôt. |

Documentation officielle : [Workers / déploiement](https://developers.cloudflare.com/workers/wrangler/commands/workers/), [D1 / commandes](https://developers.cloudflare.com/workers/wrangler/commands/d1/), [liaison D1](https://developers.cloudflare.com/workers/wrangler/configuration/) et [secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
