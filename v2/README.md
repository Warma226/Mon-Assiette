# Mon Assiette — version 2

Application web et PWA qui aide à savoir quoi manger à chaque moment de la journée, avec les plats du Burkina Faso d’abord.
Mieux choisir. Mieux manger.

## Technique

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Supabase : PostgreSQL, Auth (lien par e-mail, Google), sécurité par lignes (RLS)
- Hébergement Vercel · code sur GitHub (branche `v2`, dossier `v2/`)

## Démarrer en local

```bash
cd v2
cp .env.example .env.local   # renseigner l’adresse et la clé PUBLIQUE Supabase
npm install
npm run dev
```

Seules la clé publique (`sb_publishable_…`) et l’adresse du projet vont dans l’app. La clé de service ne doit jamais être dans le code ni dans le navigateur.

## Base de données

Les migrations versionnées sont dans `supabase/migrations/` :

| Fichier | Contenu |
|---|---|
| `20261117110000_ma2_schema.sql` | 20 tables du cahier des charges, index, contraintes, déclencheurs `updated_at`, fonctions de rôle, politiques RLS |
| `20261117111000_ma2_seed.sql` | pays, régions, moments, préférences et allergies, ingrédients, 13 plats de départ |

Le projet Supabase est partagé avec d’autres applications : toutes les tables de cette version commencent par `ma2_`.

### Règles de sécurité

- Catalogue : lisible par tous seulement quand le plat est **publié**. Écriture réservée aux rôles `admin` et `editeur` (table `ma2_admin_roles`).
- Données personnelles (profil, favoris, planning, ingrédients, préférences, allergies) : chaque personne ne voit et ne modifie que les siennes.
- Les champs d’abonnement du profil (`plus_plan`, `plus_until`) ne sont pas modifiables depuis l’app.
- Valeurs nutritionnelles : visibles seulement si `verified_at` est renseigné. Prix : seulement si `status = 'publie'`.

### Donner le rôle administrateur

Dans l’éditeur SQL de Supabase, après la première connexion de la personne :

```sql
insert into public.ma2_admin_roles (user_id, role)
select id, 'admin' from auth.users where email = 'adresse@exemple.com';
```

## Contenu

Règle du cahier : rien d’inventé. Les plats de départ ont un nom, une description générale et leurs ingrédients principaux.
Les durées, quantités, étapes de recette, prix et valeurs nutritionnelles restent vides tant qu’ils ne sont pas vérifiés ; l’app l’indique à l’utilisateur.
Photos : Wikimedia Commons, auteurs et licences dans la table des plats et sur la page « Crédits photos ».

## Pages

| Adresse | Rôle |
|---|---|
| `/` | Accueil : suggestion selon l’heure locale, tuiles, roue, découvrir |
| `/decouvrir` | Catalogue, recherche (plat, ingrédient, pays, moment), filtres |
| `/plat/[slug]` | Fiche : ingrédients, recette vérifiée, nutrition vérifiée, coût estimé, favoris, planning |
| `/ingredients` | Que cuisiner avec mes ingrédients ? (disponibles, manquants, remplacements) |
| `/planning` | Planning de la semaine : ajouter, modifier, supprimer |
| `/favoris` | Plats enregistrés |
| `/profil` | Profil alimentaire : pays, ville, budget, foyer, préférences, allergies |
| `/abonnement` | Statut Mon Assiette Plus |
| `/roue` | La roue de Kalou |
| `/connexion` | Lien par e-mail ou Google, ou découverte sans compte |
| `/credits` | Crédits photos |

## Publicités

Désactivées au lancement. Prévu plus tard : Google AdSense dans la version gratuite seulement (voir la maquette).

## Tests

`npm run build` vérifie les types et construit l’app. Les tests d’écran ont été faits avec Playwright sur un faux serveur Supabase local (données de la migration de départ), connecté et non connecté.
