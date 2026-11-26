# Vérification du 26 novembre 2026 — Les Petits Plats

Les corrections ont été réalisées à partir de l’archive transmise par Thomas Cheval. Les contrôles suivants concernent cette version du code. Les rapports datés du 11 novembre restent des pièces historiques.

## Corrections

- Page 404 conforme à la composition Figma avec photo assombrie, logo superposé, texte blanc et code jaune.
- Retour à l’accueil disponible via le logo, y compris au clavier.
- Tags affichés dans la colonne de leur filtre avec la même largeur et un écart de 20 px sur ordinateur, 12 px sur mobile.
- Compteur aligné verticalement avec la zone des filtres.
- Contraste des quantités de matériel renforcé avec le gris #737373.
- Dépendances de développement corrigées dans package-lock.json.
- Contrôles HTTP adaptés à la nouvelle page 404.

## Vérifications

- Installation neuve npm ci, 22 tests, lint et compilation réussis.
- Contrôle HTTP des 50 fiches, 50 photos, ingrédients et quantités, logo, bandeau et transformation Next/Image.
- Trois URL invalides renvoient HTTP 404 avec noindex et retour à l’accueil.
- Préchargement du bandeau vérifié sur les 50 fiches.
- Validation Nu Html Checker 26.11.26 des 52 pages générées et de la feuille CSS, zéro erreur et zéro avertissement.
- npm audit ne signale aucune vulnérabilité, dépendances de développement incluses.
- Environnement de contrôle Node.js 24.22.3.
- Un navigateur Chromium de contrôle a testé les largeurs 320, 390, 768, 1024 et 1440 px. Les parcours couvrent accueil, recherche, sélection et retrait d’un tag, fiche Poulet, 404, retour par le logo, exploration des restaurants, favori par Espace, sélection d’un plat par Espace et retour à la liste. Aucun débordement horizontal relevé sur ces vues.
- Le rendu de la 404 a été inspecté sur une capture à 1440 px. Les autres vérifications de dimensions et de navigation ont été réalisées automatiquement dans le navigateur.

## Portée

Les maquettes Figma ont été consultées dans Brave lors de l’audit. Le navigateur de contrôle utilise une copie du projet dans l’environnement de travail. Les rapports historiques et les contrôles de cette version ne constituent pas un audit complet de lecteur d’écran ni une comparaison pixel par pixel des 50 fiches.
