# Première reprise visuelle — 11 novembre 2026

Source : audit visuel Brave du 10 novembre et complément Figma fournis par Thomas. Le code a été modifié après son accord. Ce bilan concerne la première correction, pas une nouvelle inspection visuelle.

## Réalisé

- Bandeau d'accueil : photo téléchargée depuis Figma, texte officiel, hauteur 667 px et cadrage CSS calculé à partir du décalage du calque.
- Logo officiel SVG dans l'en-tête ; en-tête photographique court sur les fiches.
- Accueil desktop : filtres après 60 px, cartes après 60 px supplémentaires, largeur de grille 1236 px, gouttières de 48 px et ombre de la maquette.
- Fiches : fond blanc pleine largeur, photo indépendante de 606 × 738 px sur la référence desktop, écart de 82 px, titre de 26 px, ingrédients en trois colonnes, ordre des rubriques Figma.
- Poulet coco réunionnais : six étapes et deux quantités de matériel retranscrites du complément Figma. Les 49 autres fiches affichent toujours leur description du JSON original ; aucune étape ni quantité inventée.
- Pied de page noir commun sur toutes les pages, avec mention centrée.
- Règles de mise en colonne pour les largeurs intermédiaires et mobiles.

## Vérifié techniquement

- `npm test` : 20 tests réussis (recherche et interactions simulées).
- `npm run lint` : aucune erreur.
- `npm run build` : compilation réussie et 50 routes de recettes générées.
- `npm run test:http` sur `http://localhost:3000` : accueil, 50 fiches, assets, 404 et optimisation Next/Image servis avec succès.

## À contrôler dans un navigateur

L'accès du navigateur de Codex à `localhost:3000` a été refusé par une vérification de sécurité administrateur. Aucune capture ni mesure du rendu **après** correction n'a donc été obtenue. Les mesures CSS sont une mise en œuvre des valeurs Figma, pas une confirmation de conformité. Vérifier à 1440, 1024, 768, 390 et 320 px : cadrage et luminosité de la photo, positions du titre et de la recherche, grille, fiche Poulet, fiche longue, menus ouverts et absence de débordement horizontal. Affiner ensuite les filtres sélectionnés, badges et espacements fins d'après les captures.

## Ajustements après le contrôle dans Brave

Thomas a ensuite transmis `aaLes_Petits_Plats_Controle_Apres_Reprise_2026-11-11.md`. Ce contrôle confirme la structure principale et les adaptations aux cinq largeurs observées, sans débordement relevé sur les vues mesurées. Il ne certifie pas individuellement les 50 fiches.

Les trois corrections demandées ont été appliquées :

- Titre desktop : première ligne après « RECETTES » ; retour à un flux naturel sous 1024 px.
- Fiches : règle commune de 32 px entre toutes les rubriques, y compris entre le temps et les ingrédients.
- Étapes Poulet : intitulés au poids normal, puces pleines, interligne de 22,4 px au lieu de 25,6 px, marge de 8 px entre étapes au lieu de 20 px, sous-listes resserrées. Aucun texte supprimé ni hauteur forcée.

Après ces ajustements : lint, compilation et contrôles HTTP des 50 fiches réussis. Le rendu de cette dernière passe reste à comparer dans Brave, particulièrement la densité des étapes ; aucune nouvelle mesure visuelle n'a été réalisée par Codex.

### Validation reçue ensuite

Thomas a confirmé dans Brave les trois ajustements et la lisibilité à 390 et 320 px, sans débordement horizontal mesuré. Il accepte la légère différence de hauteur restante de la fiche Poulet. Cette passe est donc validée sur les vues examinées, sans certification pixel par pixel des 50 fiches. L'[audit final](audit-final-2026-11-11.md) décrit les contrôles et le nettoyage qui ont suivi.
