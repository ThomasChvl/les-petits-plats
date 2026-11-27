# Corrections visuelles — 27 novembre 2026

## Dossier et état initial

- Dossier modifié : `/Users/thosheulby/Desktop/les-petits-plats-main`.
- Le processus Next.js écoutant sur le port 3000 a bien ce dossier comme répertoire courant (vérification `lsof`). Ce serveur de développement existant a été conservé.
- Le dossier ne contenait pas de `.git`. Un clone temporaire du dépôt `https://github.com/ThomasChvl/les-petits-plats` a permis de comparer les fichiers à `main` (`07dd831`). Aucun écart local n'a été trouvé avant correction.
- Les métadonnées Git du clone ont été rattachées au dossier ouvert, sans remplacer les fichiers. La branche locale `main` suit `origin/main` et conserve les commits précédents. Aucun historique n'a été réécrit.
- Référence d'implémentation : observations et mesures fournies par Thomas après son audit Brave/Figma. Aucune nouvelle inspection de Figma n'est revendiquée ici.

## Corrections

### Filtres et tags

Le panneau ouvert est maintenant un bloc dans le flux normal, sur toutes les largeurs. Sa hauteur entre dans celle de la barre des filtres : les tags de sa catégorie puis les cartes passent sous lui. Le compteur reste centré dans une ligne de 56 px, au niveau des sélecteurs, même si un panneau ou plusieurs tags allongent la barre.

La sélection ferme le menu, efface sa recherche et ramène le focus sur le sélecteur. Échap ramène aussi le focus sur ce bouton. L'ouverture par Flèche bas, le clic extérieur, la sortie du focus et le passage à un autre filtre sont conservés. Lors du retrait d'un tag, le focus va au bouton de suppression suivant, au précédent ou au sélecteur si la catégorie ne contient plus de tag.

Le tag court passe de `44 + 10 + 10 = 64 px` à `44 + 6 + 6 = 56 px`. Le bouton de suppression garde une zone de 44 × 44 px. La largeur reste celle du sélecteur. Les libellés peuvent passer à la ligne et augmenter la hauteur ; aucune hauteur maximale ne coupe le texte. Les contours de focus existants sont conservés.

### Fiche Poulet : hauteur et limites de l'analyse

Le padding inférieur de `.recipe-page` passe de 100 à 70 px. Le haut reste à 70 px sur desktop et à 32 px sur mobile. La photo, les colonnes et les espacements entre rubriques sont conservés. Aucun texte, aucune sous-liste ni aucune donnée n'a été retiré.

| Point à 1440 px | Avant | Après / statut |
| --- | --- | --- |
| Hauteur totale de référence | 1566 px, relevé fourni | Cible de comparaison |
| Hauteur totale du site | Environ 1676,5 px, relevé fourni | Non mesurée après correction : accès navigateur bloqué |
| Padding haut / bas du corps | 70 / 100 px dans le code | 70 / 70 px dans le code |
| Effet du seul padding inférieur | — | Réduction attendue de 30 px à contenu et rendu identiques |
| Total si seul le padding change | — | Environ 1646,5 px **calculés**, pas mesurés |
| Écart résiduel dans cette hypothèse | 110,5 px | 80,5 px à analyser dans Brave |

L'analyse du CSS et du contenu établit les paramètres suivants :

- La préparation utilise Manrope 16 px avec un interligne de `1.4`, soit 22,4 px. Un retour à la ligne supplémentaire ajoute une ligne de cette hauteur ; le nombre de lignes réellement rendu reste à relever.
- La liste principale réserve 22 px à gauche, chaque étape ajoute 2 px, et sa sous-liste réserve encore 22 px. Dans la colonne de 572 px, les actions ont donc environ 526 px de largeur disponible. Ces retraits favorisent les retours à la ligne sur les actions longues.
- Les cinq intervalles entre les six étapes sont de 8 px, soit 40 px. Les six sous-listes ont une marge supérieure de 4 px. Le titre a une marge inférieure de 36 px et les titres de rubrique de 15 px ; les quatre intervalles entre rubriques restent à 32 px.
- Les marges des sous-listes sont désormais explicites (`4px 0 0`). Le [standard HTML, rendu des listes](https://html.spec.whatwg.org/multipage/rendering.html#lists) prévoit déjà des marges nulles pour les listes imbriquées. Il serait donc incorrect d'attribuer à cette explicitation une économie de 16 px par sous-liste dans Brave. Cette hypothèse formulée pendant l'analyse a été écartée.

Ces paramètres expliquent comment se construit la hauteur, mais ne permettent pas d'attribuer les 80,5 px restants à une cause unique sans mesurer les lignes et les styles correspondants de Figma. Les interlignes et retraits n'ont pas été réduits arbitrairement. Aucun `height`, `max-height`, masquage ou troncature n'est appliqué à la préparation. L'égalité finale avec les 1566 px n'est pas établie.

### Finitions desktop

- Retrait horizontal de 10 px sur la barre des filtres à partir de 1024 px, compteur compris. Les gouttières entre sélecteurs sont conservées (`clamp(16px, 4.3vw, 64px)` sur desktop).
- Trait de la loupe principale : `strokeWidth={1.2}` au lieu de 1,8 dans le repère SVG de 24 unités. Avec un SVG de 28 px, le trait vaut nominalement 1,4 px CSS, contre 2,1 px avant. Son repère et son centrage ne changent pas. Le bouton garde 52 × 52 px sur desktop et 44 × 44 px sur mobile. Les petites loupes internes gardent leur trait de 1,8.

## Dimensions issues du code, sans mesure de rendu

| Largeur demandée | Largeur du sélecteur / tag | Retrait de la barre | Photo de fiche prévue par le CSS | Rubriques / padding haut-bas |
| --- | --- | --- | --- | --- |
| 1440 px | 195 px | 10 px | 606 × 738 px ; colonne droite 572 px ; écart 82 px | 32 px / 70–70 px |
| 1024 px | 195 px | 10 px | Colonne unique, 760 × 650 px | 32 px / 70–70 px |
| 768 px | 170 px | 0 px | Colonne unique, 720 × 499,2 px | 32 px / 70–70 px |
| 390 px | 350 px | 0 px | Colonne unique, 350 × 300 px | 32 px / 32–70 px |
| 320 px | 280 px | 0 px | Colonne unique, 280 × 300 px | 32 px / 32–70 px |

Les valeurs de ce tableau sont calculées à partir des règles CSS pour une largeur de viewport CSS donnée. Elles ne constituent pas cinq contrôles visuels. Les tags courts ont une hauteur prévue de 56 px ; les libellés longs peuvent dépasser cette hauteur.

## Vérifications exécutées

Environnement : Node.js 22.23.4, npm 10.9.9, dépendances déjà installées au début de cette intervention. Aucune installation ni mise à jour de dépendance.

- Avant correction : 22 tests réussis.
- Après correction : `npm test`, 24 tests réussis. Les tests React ont été étendus pour la fermeture des trois menus, Échap et le retour du focus, le changement de menu, le retrait des tags avec menu ouvert, plusieurs tags d'une catégorie et un libellé long. Le simulateur de clic reproduit aussi `pointerdown` et le focus, absents de `HTMLElement.click()` seul.
- Scénarios React vérifiés : `po` → 50 recettes ; `pou` → 13 ; Ail + Mixer + Casserole → Purée de pois cassés ; Lait de coco + Blender + Verres → Limonade de Coco ; recherche inexistante → zéro recette et message ; retrait de tags → résultats et options rétablis.
- `npm run lint` : réussi.
- `npm run build` : réussi ; accueil, 404 et 50 routes de recettes générés.
- `npm run test:http` sur le serveur de développement du dossier, port 3000 : réussi.
- `TEST_BASE_URL=http://localhost:3001 npm run test:http` sur un serveur de production lancé pour ce contrôle : réussi. Ce serveur de contrôle est arrêté ensuite.
- Les contrôles HTTP couvrent les 50 fiches et JPEG, les données et quantités du JSON, les six étapes et six sous-listes du Poulet (14 actions), les descriptions intégrales des autres fiches dont Tartiflette (605 caractères), le bandeau préchargé, le logo et le retour à l'accueil dans le HTML, trois statuts 404 avec `noindex`, ainsi que Next/Image.
- Le HTML de production contient bien les deux traits de loupe principale à `1.2` et le SVG de 28 px.
- Comparaison Git : `data/recipes.json`, `data/recipe-presentation.js` et tous les fichiers de `public/` inchangés par rapport à `07dd831`.
- `git diff --check` : réussi.

Ces tests DOM et HTTP ne calculent pas la mise en page et ne prouvent ni le rendu visuel, ni l'activation native par Entrée/Espace, ni l'absence de débordement.

## Contrôles visuels encore nécessaires

La tentative d'ouverture de `http://localhost:3000/` dans Brave a été refusée : la vérification de la politique de sécurité administrateur était indisponible et l'accès n'a pas été accordé. Aucun contournement ni autre moteur de rendu n'a été employé. Aucune capture ni nouvelle mesure réelle de hauteur n'a donc été obtenue. La surcharge temporaire de viewport a été réinitialisée.

À 1440, 1024, 768, 390 et 320 px, il reste à observer : chaque filtre ouvert et le déplacement des cartes, les tags et leurs croix après manipulation des menus, plusieurs tags d'une catégorie, les libellés longs, le compteur, le focus visible et la navigation native au clavier, la fiche Poulet entière, Tartiflette, la 404 et le retour à l'accueil, et l'absence de débordement horizontal. La comparaison finale avec Figma reste séparée, dans Brave.

Pour relever les dimensions de la fiche Poulet dans la console de Brave après chargement des polices, ce code ne fait que lire la page :

```js
await document.fonts.ready;
const box = (selector) => {
  const element = document.querySelector(selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    width: rect.width, height: rect.height,
    paddingTop: style.paddingTop, paddingBottom: style.paddingBottom,
    marginTop: style.marginTop, marginBottom: style.marginBottom,
    lineHeight: style.lineHeight, gap: style.gap,
  };
};
console.log({
  viewport: innerWidth,
  pageHeight: document.body.getBoundingClientRect().height,
  horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  body: box('.recipe-page'), columns: box('.recipe-detail'),
  photo: box('.detail-photo'), rightColumn: box('.detail-body'),
  preparation: box('.preparation-steps'),
  actions: [...document.querySelectorAll('.preparation-steps ul li')].map((item) => {
    const range = document.createRange();
    range.selectNodeContents(item);
    return {
      text: item.textContent,
      lines: new Set([...range.getClientRects()].map((rect) => rect.top)).size,
      height: item.getBoundingClientRect().height,
    };
  }),
});
```

## Fichiers de cette correction

- `app/globals.css` : panneaux dans le flux, hauteur des tags, compteur, padding des fiches, marges explicites des listes, retrait desktop.
- `components/FilterDropdown.jsx` : fermeture et focus après sélection.
- `components/SelectedTags.jsx` : maintien d'un focus utile après suppression.
- `components/Icons.jsx`, `components/SearchBar.jsx` : trait de la loupe principale.
- `tests/ui.test.mjs`, `tests/http-check.mjs` : contrôles de régression.
- `docs/corrections-visuelles-2026-11-27.md` : ce bilan, avec les limites et le relevé restant à effectuer.

La publication demandée porte sur ces fichiers et doit ajouter un commit à `main`, sans push forcé. La conformité des valeurs CSS ci-dessus est contrôlée dans le code ; la conformité visuelle finale et la hauteur totale restent à confirmer.
