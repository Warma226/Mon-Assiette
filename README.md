# Mon Assiette — ton assistant nutrition

Application mobile (PWA) qui répond à une question simple et pourtant difficile en Afrique de l'Ouest : **« Qu'est-ce que je mange, et pourquoi ? »**
Beaucoup de gens ont les moyens, mais ne savent pas quoi manger et manquent souvent d'appétit. Mon Assiette les accompagne comme une nutritionniste : un bilan, des priorités, puis **le repas idéal au bon moment, avec sa raison**. Avec **Kalou**, la petite calebasse qui sert de coach.

Application **individuelle** : un profil, un bilan, un plan.

## Le parcours

1. **Bilan (la consultation)** : 7 étapes — prénom ; sexe, âge, activité ; poids et taille (facultatif) ; objectif ; santé (diabète, tension, anémie, cholestérol, estomac sensible, grossesse, allaitement) ; **allergies** (arachide, lait, œuf, poisson, crustacés, gluten) et régime végétarien ; habitudes (petit-déjeuner, légumes, fruits, boissons sucrées, cubes, **appétit**, eau).
2. **Rapport de bilan** : portrait (IMC indicatif, jamais pour les ados ni pendant la grossesse), score des habitudes, **3 priorités expliquées**, aliments à privilégier et à limiter, allergènes retirés, objectif d'eau personnalisé, conseils pour retrouver l'appétit, mises en garde médicales.
3. **Le moment idéal** (accueil) : le prochain repas à manger maintenant, avec **« Pourquoi maintenant ? »** et **« Ce que ce repas t'apporte »**, la recette, « Autre idée », « Je le mange ».
4. **Thème du jour** : lundi énergie, mardi fer, mercredi légumes, jeudi protéines, vendredi léger, samedi plaisir, dimanche douceur.
5. **Journée idéale** : petit-déjeuner 7:30, collation 10:00, déjeuner 13:00, **dessert** 13:30, **boisson bien-être** 17:00, dîner 19:30.
6. **Roue nutritionnelle** : énergie, protéines, fer, fibres, vitamines, calcium, légumes — se remplit à chaque repas noté.
7. **Suivi** : défi de la semaine lié à la priorité n°1, série de jours (2 repas notés minimum), objectif d'eau.
8. **Cuisiner** : « J'ai ces ingrédients » (Kalou propose quoi préparer) et « Améliorer un plat ».
9. **Courses** : liste calculée à partir du plan (2 jours en gratuit, 7 jours avec Plus).
10. **Kalou** : répond selon le bilan (pourquoi ce menu, allergies, appétit, grignotage, soir, diabète…).
11. **Plus** : essai gratuit de 72 h, formules Semaine / Mois / 3 mois, Orange Money, Moov Money ou carte, codes entreprise.

## Sur quelle base sont faits les menus ?

- Recommandations générales de l'**OMS** et de la **FAO** : assiette équilibrée (½ légumes, ¼ céréales, ¼ protéines), moins de sel, de sucre et de gras, plus de légumes, de haricot et de céréales locales (mil, sorgho, fonio).
- Un **catalogue de 54 plats et boissons** d'Afrique de l'Ouest (`js/content.js`), chacun décrit par ses ingrédients, ses **allergènes** et ses atouts (fer, protéines, fibres, index glycémique bas, sel, gras…).
- Un **moteur** (`js/engine.js`) qui transforme le bilan en priorités, puis en poids nutritionnels, et choisit chaque jour les plats qui servent le mieux ces priorités, avec de la variété.
- **Règles strictes** : un plat contenant un allergène déclaré n'est jamais proposé ; végétarien = ni viande, ni poisson, ni crustacés ; pas de tisanes pendant la grossesse ou l'allaitement par prudence.
- **Test automatique** : 2 000 profils au hasard × 30 jours de menus = 366 557 repas contrôlés, **0 violation**.
- ⚠️ Tout le contenu doit être **relu et validé par une nutritionniste diplômée** avant le lancement public.

## Technique

- HTML, CSS et JavaScript, **sans dépendance ni compilation** : rapide sur les petits téléphones Android.
- PWA installable, hors ligne, effets sonores synthétisés (coupables dans le profil), lecture audio des conseils (synthèse vocale du téléphone, en français).
- **Supabase** : pas de compte ; identifiant anonyme par téléphone (`x-device-id`) et règles RLS. **La santé, les allergies et les habitudes restent sur le téléphone** et ne sont jamais envoyées.
- Hébergé sur **Vercel**. Icônes 3D : **Fluent Emoji** de Microsoft (licence MIT, `assets/icons/LICENSE-fluentui-emoji.txt`).

```
js/content.js   catalogue des plats, recettes, thèmes, bilan, défis
js/engine.js    bilan, priorités, plan du jour, explications, « j'ai ces ingrédients »
js/views.js     écrans
js/app.js       état, navigation, actions, rappels, Kalou
js/sfx.js       effets sonores
js/store.js     stockage local et synchronisation
js/api.js       Supabase (REST)
```

## Logos des opérateurs de paiement

Déposer les logos officiels (fournis dans le kit marchand de l'opérateur ou de l'agrégateur de paiement) ici :

```
assets/pay/orange-money.png
assets/pay/moov-money.png
```

Ils s'affichent automatiquement. En leur absence, l'app montre une pastille aux couleurs de l'opérateur.

## À faire avant le lancement public

- Validation de tout le contenu par une nutritionniste.
- Brancher le paiement Mobile Money (CinetPay, PayDunya ou FedaPay) à la fin de l'essai.
- Logos officiels des opérateurs.

## Version 3

- **Pays de résidence** (question obligatoire) : Burkina Faso, Côte d'Ivoire, Sénégal, Mali, Bénin, Togo, Niger, Guinée, ou « autre pays » (GMT ou GMT+1). Le menu ne propose que des plats courants dans le pays, avec leur nom local (Ndambé, Thiakry, Watché/Ayimolou, Tigadèguèna…), et les plats signature du pays passent devant. 21 plats nationaux ajoutés (75 au total).
- **Heure du pays** : l'app lit l'heure murale du fuseau du pays choisi (`js/time.js`), pas celle du téléphone : moment idéal, rappels, thème du jour, changement de jour, défis et série.
- **Fiche de chaque plat** : description, temps de préparation, « plat de chez toi », autre nom.
- **Questions obligatoires et facultatives** : badges sur chaque question, bouton « Passer » sur les étapes facultatives. Obligatoire : prénom, pays, sexe, âge, objectif, santé (réponse explicite), grossesse/allaitement pour les femmes concernées, allergies (réponse explicite). Facultatif : activité, poids/taille, régime, habitudes.
- **La roue de Kalou** : choisis le moment et le temps disponible, la roue ne contient que des plats sûrs pour ton profil et de ton pays. La taille de chaque case dépend de l'intérêt du plat pour ton bilan. 3 relances, puis « Je le prépare » l'ajoute au menu du jour.
- **Paiement par pays** : opérateurs, indicatif et longueur du numéro selon le pays.
- Base : colonne `country` ajoutée à `ma_profiles`.

## Voix humaines (Azure Speech, offre gratuite)

- Fonction serveur `supabase/functions/ma-tts` : fabrique l'audio avec les voix neuronales Microsoft (Denise, Henri, Vivienne, Rémy). La clé reste sur le serveur.
- Chaque audio est gardé (bucket privé `ma-tts`) et réutilisé pour tout le monde : un conseil ou une recette n'est fabriqué qu'une fois.
- Plafonds : 450 000 caractères par mois au total (l'offre gratuite en donne 500 000), 60 nouvelles synthèses par téléphone et par jour.
- Secrets à renseigner dans Supabase : `AZURE_SPEECH_KEY` et `AZURE_SPEECH_REGION`. Sans eux, l'app utilise la voix du téléphone.

## Paiement (PayDunya)

- Fonction serveur `supabase/functions/ma-pay` : crée la facture PayDunya (prix fixés côté serveur : 650 F la semaine, 2 500 F le mois), reçoit la notification de paiement (IPN, vérifiée par le hash SHA-512 de la clé principale), puis revérifie le paiement directement chez PayDunya avant d'activer Plus.
- Table `ma_payments` (lecture seule pour l'appareil concerné) et fonction `ma_apply_payment` : un paiement n'est appliqué qu'une fois, les jours s'ajoutent à l'abonnement en cours.
- Dans l'app : bouton « Payer », redirection vers la page PayDunya (Orange Money, Moov, MTN, Wave, carte selon le pays), retour automatique et activation.
- Secrets à renseigner dans Supabase : `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_PRIVATE_KEY`, `PAYDUNYA_TOKEN`, et `PAYDUNYA_MODE` (`test` par défaut, `live` pour les vrais paiements).
