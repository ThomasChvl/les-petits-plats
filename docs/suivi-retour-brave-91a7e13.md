# Suite du contrôle Brave de 91a7e13 — 27 novembre 2026

## Sources et état initial

Travail dans `/Users/thosheulby/Desktop/les-petits-plats-main`, branche `main`, dépôt `https://github.com/ThomasChvl/les-petits-plats`. Le serveur existant sur le port 3000 utilise bien ce dossier (contrôle `lsof`). Le commit local et le distant étaient `91a7e13` au début de cette passe.

Les mesures ci-dessous proviennent du fichier **Retour_Codex_apres_verification_Brave_91a7e13.md fourni par Thomas**, pas d'une mesure réalisée ici. Ce retour confirme déjà les tags de 56 px, les retraits de la barre, le déplacement de la grille, la loupe et plusieurs parcours au clavier sur les cinq largeurs.

La suppression locale de `docs/corrections-visuelles-2026-11-27.md` existait avant cette intervention. Elle est conservée dans le dossier de travail et exclue de ce commit. Le document reste dans l'historique distant.

## Suppression d'un tag au premier clic

La cause est confirmée par le code et un test de régression : `FilterDropdown` fermait le menu sur `blur` dès que le focus passait du sélecteur ou du champ vers la croix du tag, située hors de ce composant. La fermeture pouvait donc déplacer la croix **avant** le relâchement du pointeur et le clic. Une simulation qui appelle simplement `.click()` ne reproduit pas cette perte de cible.

La fermeture sur perte de focus appartient maintenant au conteneur commun `.filters`, qui englobe tous les menus et tags. Le transfert du focus vers une croix ne ferme plus le panneau pendant l'appui. `removeTag` ferme le panneau lors du clic effectif, en même temps qu'il retire le tag. Le maintien du focus sur le tag voisin ou le sélecteur est conservé. Ce périmètre commun évite également la fermeture prématurée lorsqu'on vise le tag d'une autre catégorie, notamment sur mobile où les catégories sont empilées.

Échap est traité au même niveau : il ferme le menu actif et rend le focus à son sélecteur, même depuis une croix. La sélection d'une option, l'ouverture par Flèche bas, le passage à un autre filtre, la sortie du focus de la zone complète et le clic extérieur restent couverts.

Le test ajouté échoue sur `91a7e13` : le panneau est déjà fermé entre l'appui et le relâchement. Après correction, il reste ouvert à ce stade et un seul clic supprime le tag, rétablit les 50 recettes et rend son option disponible. Le test couvre les trois catégories et un menu d'une autre catégorie.

La simulation sépare les phases `pointerdown` → `mousedown` → transfert de focus, puis `pointerup` → `mouseup` → `click`, en laissant React appliquer les changements entre les deux. Elle vérifie la présence du panneau et l'identité de la cible avant le relâchement. **jsdom ne calcule pas les coordonnées : le clic avec mise en page réelle reste à reproduire dans Brave.**

## Fiche Poulet : application des nouvelles propriétés

La préparation détaillée reçoit une classe dédiée, uniquement lorsqu'une recette possède des étapes détaillées. Les 49 descriptions simples conservent leurs styles.

- Sur la vue à deux colonnes (`min-width: 1101px`), la rubrique de préparation a une largeur égale à celle de sa colonne plus 25 px : **597 px prévus à 1440 px**, conformément au calque relevé dans Figma. Les colonnes de 606 et 572 px, la photo de 606 × 738 px et leur écart de 82 px ne changent pas.
- Les 25 px supplémentaires occupent une partie de la marge extérieure disponible ; cette marge vaut au moins 40 px dans la vue à deux colonnes. La colonne et la grille ne sont pas élargies.
- Dans cette vue, la préparation passe de `line-height: 1.4` à `1`, soit **16 px pour le texte de 16 px**, traduction littérale de l'interligne Figma de 100 % fourni.
- À 1100 px et en dessous, la rubrique reprend la largeur normale de la colonne, sans les 25 px supplémentaires. L'interligne reste à **22,4 px** pour la lisibilité sur tablette et mobile.
- Les retraits existants des listes (22 px + 2 px + 22 px), les cinq intervalles de 8 px et les six marges supérieures de 4 px restent en place. Le retour ne fournit pas de nouvelles valeurs pour ces paramètres. Une précision sur les retraits et espacements Figma ainsi que sur la nature du cadre de 572 px a été demandée pendant le travail ; aucune nouvelle valeur n'a été supposée.
- Aucun texte n'est supprimé ; les six étapes et quatorze actions, le padding de 70 px en haut et en bas sur desktop, et les 32 px entre rubriques sont conservés. Aucune hauteur fixe, hauteur maximale ni troncature n'est ajoutée.

### Dimensions avant et après

| Élément à 1440 px | Avant, mesuré dans le retour Brave | Référence Figma fournie | Après cette passe |
| --- | --- | --- | --- |
| Page entière | 1646,53 px | 1566 px | **Non mesurée** |
| Colonne droite | 572 × 1240,53 px | 572 × 1160 px | Largeur inchangée ; hauteur non mesurée |
| Liste de préparation | 572 × 646,36 px | 597 × 572 px | Largeur CSS prévue : 597 px ; hauteur non mesurée |
| Rubrique Recette, titre compris | Non chiffrée dans le retour | 597 × 603 px | Largeur CSS prévue : 597 px ; hauteur non mesurée |
| Interligne de préparation | 22,4 px | 100 % annoncé | 16 px prévus sur desktop ; 22,4 px sous 1101 px |

**La hauteur cible de 1566 px n'est pas déclarée atteinte.** Les mesures ne suffisent pas à reconstruire à elles seules les espacements du calque Figma : les 26 lignes relevées dans la liste actuelle à 22,4 px, plus 64 px de marges, expliquent bien ses quelque 646,36 px. Avec les mêmes 26 lignes à 16 px, on aurait environ 480 px, et l'élargissement peut encore changer le nombre de lignes. Cette estimation arithmétique n'est pas une mesure après correction. La largeur et l'interligne sont appliqués ; les espacements et la densité finale restent à comparer avec le texte Figma, sans forcer artificiellement sa hauteur.

## Avertissement LCP de la première photo

LCP désigne le plus grand élément visible pendant le chargement. `RecipeCard` utilisait le chargement différé par défaut de `next/image`, y compris pour la première photo des résultats, candidate LCP relevée dans Brave.

L'explorateur transmet maintenant `eager` uniquement à la première carte **des résultats actuels**. Sa photo utilise `loading="eager"` ; les autres restent en `loading="lazy"`. Le choix suit la position après filtrage, et non uniquement le fichier Recette01.jpg. Aucun groupe de photos ni toute une première ligne n'est chargé par anticipation. Le préchargement du bandeau est conservé.

La documentation installée de Next.js (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`, rubriques `loading` et `preload`) a été consultée. Aucun `priority` obsolète ni `preload` explicite n'a été ajouté aux cartes. Le HTML servi montre que React émet lui-même un lien de préchargement pour la première image `eager` ; les tests acceptent ce lien pour Recette01.jpg et interdisent d'autres cartes préchargées au catalogue initial.

La première carte peut être sous la ligne de flottaison selon la hauteur de fenêtre. Cette règle se limite à une seule candidate signalée pendant les parcours. Aucun gain chronométré de LCP, aucune vérification réseau réelle après filtrage et aucune disparition de l'avertissement dans la console de Brave ne sont revendiqués ici.

## Vérifications exécutées

Environnement : Node.js 22.23.4, npm 10.9.9. Aucune dépendance installée ou mise à jour.

- Test de régression avant correction : échec attendu sur la fermeture prématurée du panneau.
- `npm test` après correction : **27 tests réussis**, dont la séquence de pointeur en deux phases, Échap depuis le tag, le maintien du focus et la sélection de la première photo après filtrage.
- Les scénarios de recherche et de cumul précédents restent verts : `po` → 50, `pou` → 13, Ail + Mixer + Casserole → Purée de pois cassés, Lait de coco + Blender + Verres → Limonade de Coco, zéro résultat, suppression des tags et recalcul des options.
- `npm run lint` : réussi.
- `npm run build` : réussi ; accueil, 404 et 50 routes de recettes produits.
- `npm run test:http` sur le serveur existant, port 3000 : réussi.
- `TEST_BASE_URL=http://localhost:3001 npm run test:http` sur le serveur de production de contrôle : réussi ; serveur de contrôle arrêté ensuite.
- Contrôles HTTP : 50 fiches et photos, ingrédients et quantités du JSON, six étapes, six sous-listes et quatorze actions, descriptions intégrales dont Tartiflette, préchargement des bandeaux, première photo immédiate et 49 différées, absence de préchargement supplémentaire des cartes, logo, trois 404 avec retour à l'accueil, Next/Image.
- Comparaison Git : aucune modification de `data/recipes.json`, `data/recipe-presentation.js` ou des fichiers `public/`.
- `git diff --check` : réussi pour les fichiers de cette correction.

## Contrôles restant à confirmer dans Brave

Une nouvelle tentative d'ouverture de localhost a été refusée par la vérification de la politique administrateur. Aucun contournement n'a été tenté et la surcharge de viewport a été réinitialisée. Il n'y a donc **aucune nouvelle mesure ni capture de rendu de Codex** dans cette passe.

À 1440, 1024, 768, 390 et 320 px :

1. Reproduire le retrait de Lait de coco avec son menu ouvert : un seul clic doit ramener le compteur de 3 à 50. Contrôler aussi un tag d'une autre catégorie avec un panneau ouvert et le cumul de plusieurs tags.
2. Vérifier Entrée/Espace, Échap, Tab, clic extérieur et retour du focus. Les tests DOM ne prouvent pas les actions natives du clavier ni la stabilité géométrique.
3. Après chargement des polices, relever la hauteur totale du Poulet, la colonne droite, la liste et la rubrique Recette. Comparer à 1566, 1160, 572 et 603 px. Contrôler la lisibilité de l'interligne desktop de 16 px et les espacements Figma manquants.
4. Vérifier le maintien des six étapes et quatorze actions, les petits écrans et l'absence de débordement, en particulier le dépassement volontaire de 25 px sur desktop.
5. Refaire le parcours qui signalait Recette01.jpg comme LCP et vérifier la console et le réseau, y compris après filtrage. Les attributs HTML seuls ne prouvent pas la disparition du message.

## Fichiers concernés

`components/FilterDropdown.jsx`, `components/RecipeExplorer.jsx`, `components/RecipeCard.jsx`, `app/recette/[slug]/page.jsx`, `app/globals.css`, `tests/ui.test.mjs`, `tests/http-check.mjs` et ce bilan. La publication ajoute un commit à l'historique existant, sans push forcé ; la suppression locale du précédent bilan reste hors de ce commit.
