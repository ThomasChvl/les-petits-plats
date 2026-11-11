# Vérification — Les Petits Plats

Date : 10 novembre 2026. Contrôles réalisés sur ce dépôt local.

## Résultat et périmètre

Fonctions des étapes 2 à 7 implémentées : 50 recettes, pages individuelles, 404 personnalisée, tags et recherche principale combinée. **La conformité visuelle à Figma reste à vérifier.**

Le projet existant a été converti en JavaScript/JSX après le choix explicite de l'utilisateur. Aucun backend, base de données, service payant ou publication distante ajouté. La structure des dossiers et les composants sont détaillés dans le README.

## Diagnostic initial

Dépôt propre avec commit initial create-next-app ; Next.js 16.4.6, React 19.3.0, Node 22.23.4, npm 10.9.9. App Router, TypeScript et Tailwind présents ; page de démarrage sur localhost:3000, aucune recette intégrée.

Guides de la version installée lus dans node_modules/next/dist/docs : routes dynamiques, paramètres asynchrones, 404, images, polices, CSS et configuration du cache.

## Sources consultées

| Référence                                                                                                                                                                                           | Résultat réel                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Mission OpenClassrooms](https://openclassrooms.com/fr/paths/2464/projects/3665/5552-mission---developpez-un-site-de-recettes-avec-react)                                                           | Étapes illisibles ici : outil web en échec, réponse HTTP demandant un navigateur moderne. Périmètre fondé sur la mission fournie et les PDF récupérés.   |
| [Figma officiel](https://www.figma.com/design/08aVw3Mso2dPnFNkhSxQbW/Les-petits-plats---Maquette-2.0)                                                                                               | Outil web en échec ; navigateur refusé par un contrôle de sécurité administrateur indisponible. Aucune vue ni mesure inspectée.                          |
| [Données OpenClassrooms](https://github.com/OpenClassrooms-Student-Center/P4-JS-mission-petits-plats)                                                                                               | recipes.json téléchargé depuis main : 50 recettes, 50 identifiants et 50 slugs uniques.                                                                  |
| [Archive des images](https://course.oc-static.com/projects/D%C3%A9veloppeur+Web/JS/P7/JSON+recipes.zip)                                                                                             | Récupérée avec curl ; 50 JPEG associés selon le champ image du JSON.                                                                                     |
| [Cas d'utilisation](<https://course.oc-static.com/projects/516_JS/P7/Cas+d%E2%80%99utilisation+%2303+_+Filtrer+les+recettes+dans+l%E2%80%99interface+utilisateur+-+Front-end+P6+(Algorithms)+.pdf>) | 4 pages lues intégralement ; copie dans references/cas-utilisation.pdf.                                                                                  |
| [Auto-évaluation](https://course.oc-static.com/projects/2288_Dev_React/P4/Dev+React+3.0+Projet+4+-+Fiche+d'auto-e%CC%81valuation.pdf)                                                               | Document lu intégralement, section « Mission — Les Petits Plats » distinguée des exercices Ohmyfood. Copie dans references/auto-evaluation.pdf.          |
| Documentation technique fournie                                                                                                                                                                     | Next.js : installation, routes dynamiques, notFound. React : composants, listes, state. Conventions spécifiques revérifiées dans les guides Next locaux. |
| [Debounce & Throttle](https://grafikart.fr/tutoriels/debounce-throttle-642)                                                                                                                         | Résumé consulté. Pas de délai ajouté : index local et useMemo, actualisation à chaque frappe.                                                            |

Les PDF et l'archive ont d'abord échoué via les outils web/Python, puis ont été récupérés avec curl sur les URL officielles.

Le navigateur a aussi refusé localhost pour la même raison de sécurité. Aucun autre navigateur ni moyen de contrôle n'a été utilisé pour contourner ce refus. HTTP et jsdom ne remplacent pas une vérification visuelle.

## Étapes réalisées

| Étape         | Réalisation                                                                                          | Vérification                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 2 — Accueil   | Header, bannière, carte réutilisable, grille ; structure initialement servie avec 3 vraies recettes. | Structure HTML contrôlée. Styles adaptatifs écrits ; rendu et conformité à comparer.                |
| 3 — Catalogue | JSON original, mapping, clés stables, images locales, quantités facultatives.                        | 50 cartes par HTTP/jsdom, sans warning React dans les scénarios testés.                             |
| 4 — Routes    | app/recette/[slug]/page.jsx, await params, Link, métadonnées, 50 pages préconstruites.               | 50 routes : titre, description, nombre d'ingrédients, liens de retour. Clics réels encore à tester. |
| 5 — 404       | notFound(), not-found.jsx, refus des slugs hors catalogue.                                           | 3 URL invalides : statut 404, HTML personnalisé, noindex, lien d'accueil.                           |
| 6 — Tags      | Recherche interne, options uniques issues des résultats, sélection, suppression, intersection.       | Logique et interactions React réussies, dont les 3 catégories combinées.                            |
| 7 — Recherche | Dès 3 caractères utiles, titre/description/ingrédients, accents, casse, compteur, état vide.         | Logique et interactions React réussies.                                                             |

## Décisions techniques

- **JSON intact :** identique octet par octet au téléchargement officiel. SHA-256 : f1ae2296b91aa88229afc3f04e3bc74c4d5a74ee43803a9b0e4f3eb24f143b73. Formulations originales conservées.
- **Photos :** dimensions limitées à 1600 × 1600 sans agrandissement, proportions et orientation conservées, JPEG qualité 85. Originaux extraits : 257 097 750 octets ; public/images : 10 682 305 octets. images-manifest.json conserve tailles et empreintes des originaux et versions web. Originaux de travail dans /tmp/les-petits-plats-resources, dossier temporaire ; l'archive officielle reste la source durable.
- **Polices :** Anton et Manrope téléchargées depuis google/fonts, licences OFL conservées. Correspondance à Figma non contrôlée.
- **Recherche :** index normalisé ; fragment recherché dans les champs autorisés, puis correspondance exacte de tous les tags. Aucune recherche approximative ou fusion singulier/pluriel.
- **Normalisation :** Unicode, minuscules, accents, ligatures œ/æ, apostrophes, espaces. Données affichées intactes ; options dédupliquées selon la même méthode.
- **State :** texte, tags et filtre ouvert. Résultats/options calculés avec useMemo. Texte interne dans FilterDropdown, aucun state dupliquant les résultats.
- **404 :** cacheComponents et partialPrefetching retirés, puis dynamicParams = false pour les 50 slugs préconstruits. Les premiers essais ne fournissaient pas le corps HTML personnalisé d'une recette inconnue. Configuration finale vérifiée en développement et production : statut 404 et HTML personnalisé. notFound() reste dans la page.
- **Accessibilité préparée :** français, lien d'évitement, titres, labels, boutons nommés, compteur annoncé, focus visible, Échap et retour du focus. Contrôle complet au clavier/lecteur d'écran encore manuel.
- **Dépendances :** aucune bibliothèque de recherche ; jsdom et esbuild seulement pour les tests de développement.
- **Configuration conservée :** versions React/Next, scripts, règle CSS Turbopack et agentFeedback initial. Tailwind reste installé ; interface en CSS standard.

## Tests exécutés et résultats

| Contrôle                                              | Résultat                                                                                                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm test                                              | 20 réussites : 15 tests de données/logique, 5 tests de composants et avertissements.                                                                                                      |
| npm run lint                                          | Réussi, aucun diagnostic ESLint.                                                                                                                                                          |
| npm run build                                         | Réussi : accueil, 404 et 50 recettes préconstruits.                                                                                                                                       |
| npm run start -- --port 3001                          | Serveur de production lancé pour les contrôles, puis arrêté.                                                                                                                              |
| TEST_BASE_URL=http://localhost:3001 npm run test:http | Réussi : accueil, 50 liens, 50 pages, 50 JPEG identiques aux fichiers locaux, 3 URL invalides et une image Next/Image optimisée.                                                          |
| npm run test:http sur localhost:3000                  | Réussi sur le serveur de développement présent à l'arrivée et réutilisé : mêmes contrôles complets que sur le serveur compilé. Aucun nouveau lancement initial de npm run dev revendiqué. |
| git diff --check                                      | Réussi.                                                                                                                                                                                   |
| Intégrité JSON                                        | Empreinte identique au téléchargement officiel.                                                                                                                                           |
| Console React dans jsdom                              | Aucun warning ni erreur pendant les interactions testées ; ne vaut pas pour la console d'un vrai navigateur.                                                                              |

Parcours jsdom : recherche interne COCO, Lait de coco (3 recettes), Blender puis Verres (1), suppression des tags (retour à 50), options retirées/rétablies, option vide, Échap et focus ; recherche co (50), coco, CRÈME/creme, effacement, critères combinés, zéro résultat et retour au catalogue. Compteurs contrôlés.

Avertissement Next.js : package-lock.json extérieur au dépôt, dans /Users/thosheulby. Il n'empêche ni compilation ni lancement ; ce fichier extérieur n'a pas été modifié.

## Auto-évaluation officielle

| Indicateur Mission — Les Petits Plats                          | État                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| Initialisation create-next-app                                 | Déjà faite à l'arrivée, conservée.                         |
| Layout, carte paramétrable, composants de tags                 | Implémentés et testés.                                     |
| State des tags                                                 | RecipeExplorer ; texte interne dans FilterDropdown.        |
| Link et dossier [slug]                                         | Destinations et pages contrôlées ; clics réels à vérifier. |
| not-found.jsx et URL invalides                                 | Vérifiés, HTML et statut inclus.                           |
| Sélection : retrait de l'option, mise à jour résultats/options | Tests de logique et composants réussis.                    |
| Suppression : retour de l'option et mise à jour                | Tests de logique et composants réussis.                    |
| Recherche selon le cas d'utilisation                           | Filtrage couvert ; validation W3C à effectuer.             |

## Vérifications manuelles restantes

1. Comparer les vues à des captures ou un export Figma. Logo typographique, symbole CSS, bannière Recette11, texte du titre, couleurs, polices et espacements sont provisoires et non extraits de Figma.
2. Vérifier ordinateur, tablette et mobile, par exemple 1440, 768, 390 et 320 pixels : débordements, recadrages, menus, lisibilité. Règles CSS à 1023 et 639 pixels préparées, sans validation visuelle.
3. Tester navigation et filtres au clavier/lecteur d'écran ; inspecter console et réseau du vrai navigateur.
4. Passer HTML et CSS au validateur W3C. Les tests réalisés ne remplacent pas cette validation.
5. Relire étapes et livrables dans la session OpenClassrooms avant de déclarer la mission conforme.

Prochaine étape pédagogique : lire RecipeExplorer et lib/search.mjs pour expliquer « saisie → résultats → options disponibles », puis comparer l'interface à la maquette.
