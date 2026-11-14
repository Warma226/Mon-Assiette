# Mon Assiette

Application mobile (PWA) qui aide les familles d'Afrique de l'Ouest à mieux manger : **quoi manger, quand et comment**, avec les produits locaux et selon leur budget. Avec **Kalou**, la petite calebasse qui sert de coach.

## Fonctionnalités

- **Bienvenue** en 3 écrans animés, puis **questionnaire** (prénom, objectif, foyer, budget, langue).
- **Accueil** : score d'équilibre du jour (repas + eau), suivi de l'eau, actions rapides, astuces de Kalou (lecture audio), repas du jour à cocher.
- **Plan repas** : 7 jours, filtres Matin / Midi / Soir, progression animée, historique.
- **Améliorer un plat** : riz gras, tô gombo, sauce arachide, attiéké, benga. Score d'équilibre en direct. 3 par semaine en gratuit.
- **Marché et budget** : menus à 500, 1 000 ou 2 000 F CFA par personne, produits de saison, liste de courses partageable sur WhatsApp.
- **Chat avec Kalou** : réponses aux questions courantes (enfants, diabète, grossesse, eau, budget…). Questions envoyées à une nutritionniste pour les abonnés Plus.
- **Profil** : modification des réponses, rappels repas et eau, installation sur le téléphone, effacement des données.
- **Offres Plus** : essai gratuit de **72 h** (une fois par téléphone), formules Semaine / Mois / Famille, Orange Money, Moov Money ou carte, codes entreprise ou mutuelle.
- **Fonctionne hors connexion** : tout est enregistré sur le téléphone puis synchronisé dès que le réseau revient.

## Technique

- HTML, CSS et JavaScript modernes, **sans dépendance ni étape de compilation** : rapide sur les petits téléphones Android.
- PWA installable (manifest + service worker), cache hors ligne.
- **Supabase** pour la base de données. Pas de compte : chaque téléphone reçoit un identifiant anonyme envoyé dans l'en-tête `x-device-id`, et les règles RLS ne laissent chaque téléphone voir que ses propres données.
- Hébergé sur **Vercel** (site statique).

```
index.html            page unique
css/app.css           styles et animations
js/app.js             état, navigation, actions, rappels
js/views.js           écrans
js/content.js         contenus (conseils, plats, menus, réponses de Kalou)
js/art.js             Kalou et icônes (SVG)
js/store.js           stockage local et file de synchronisation
js/api.js             appels à Supabase (REST)
js/config.js          URL et clé publique Supabase
sw.js                 service worker
supabase/migrations/  schéma de la base
```

## Base de données

Tables (préfixe `ma_`) : `ma_profiles`, `ma_meal_logs`, `ma_water_logs`, `ma_improvements`, `ma_questions`, `ma_org_codes`.
Fonctions : `ma_start_trial(plan)`, `ma_cancel_trial()`, `ma_redeem_code(code)`.
Code de démonstration entreprise : `DEMO2026`.

Pour créer un code entreprise (dans l'éditeur SQL de Supabase) :

```sql
insert into ma_org_codes (code, org_name, max_uses) values ('SONABEL2027', 'SONABEL', 500);
```

## Lancer en local

N'importe quel serveur statique suffit :

```
npx serve .
```

## À faire avant le lancement public

- Faire relire tous les conseils par une nutritionniste (fichier `js/content.js`).
- Brancher le paiement Mobile Money (CinetPay, PayDunya ou FedaPay) à la fin de l'essai.
- Enregistrer les audios en mooré, dioula et fulfuldé.
- Remplacer la photo des élèves par une photo prise dans la région, et vérifier les droits des photos.
