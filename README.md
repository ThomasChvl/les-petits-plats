# Les Petits Plats

Application OpenClassrooms de consultation et de recherche de recettes : Next.js 16.4.6, React 19.3.0, JavaScript/JSX, App Router et CSS standard.

## Lancer le projet

Environnement vérifié : Node.js 22.23.4 et npm 10.9.9.

Utilise cette version de Node pour reproduire les vérifications. Une version trop ancienne d'une autre branche peut provoquer des avertissements de compatibilité des outils de test.

```bash
npm ci
npm run dev
```

Ouvre http://localhost:3000. Pour la version compilée, après arrêt du serveur de développement :

```bash
npm run build
npm start
```

## Fonctions

- 50 recettes et photos fournies par OpenClassrooms.
- Pages individuelles, par exemple `/recette/poisson-cru-a-la-tahitienne`.
- Page 404 et lien vers l'accueil pour les adresses inconnues.
- Recherche dès 3 caractères dans le nom, les ingrédients et la description, sans distinction de casse ni d'accents.
- Tags ingrédients, appareils et ustensiles, cumulables entre eux et avec la recherche.
- Options dédupliquées issues des résultats ; sélection et suppression des tags.
- Compteur actualisé et message en l'absence de résultat.

## Organisation

```text
app/
  layout.jsx                  Langue, métadonnées, polices et styles
  page.jsx                    Données et accueil
  globals.css                 Styles et règles adaptatives
  not-found.jsx               Page 404 commune
  recette/[slug]/
    page.jsx                  Recette et génération des 50 pages
components/
  Header.jsx, Hero.jsx        Identité et bannière
  Footer.jsx                 Pied de page commun
  RecipeExplorer.jsx          State partagé et résultats
  SearchBar.jsx               Recherche principale
  FilterDropdown.jsx          Liste et recherche d'un filtre
  SelectedTags.jsx            Tags et suppression
  RecipeCard.jsx              Carte réutilisable
  IngredientList.jsx          Ingrédients et quantités
  MaterialList.jsx            Matériel et quantités facultatives
  Icons.jsx                   Icônes SVG
lib/search.mjs                Logique indépendante de React
data/recipes.json             Données originales
data/recipe-presentation.js   Étapes attestées de la fiche Poulet
public/images/                50 photos optimisées et photo du bandeau
public/logo.svg               Logo officiel
public/fonts/                 Polices locales et licences
tests/                        Logique, composants React et HTTP
docs/                         Rapport, sources PDF et manifeste des images
```

## Comprendre la recherche

`RecipeExplorer` stocke le texte, les tags sélectionnés et le filtre ouvert avec `useState`. Un _state_ est une information qui peut changer et provoquer un nouvel affichage.

`createSearchIndex` prépare les textes normalisés une fois. Normaliser retire les différences de casse et d'accents pour comparer les mots, sans modifier le JSON original.

`filterRecipes` vérifie la recherche et **tous** les tags. C'est une intersection : Lait de coco et Poulet conservent seulement les recettes ayant les deux ingrédients. Sous 3 caractères utiles, les tags continuent de fonctionner.

`getFilterOptions` extrait les choix des recettes restantes et retire les tags sélectionnés. `useMemo` conserve un résultat tant que ses données d'entrée n'ont pas changé. Aucun délai artificiel ni bibliothèque de recherche.

Les slugs proviennent des données. `generateStaticParams` prépare 50 pages à la compilation ; `dynamicParams = false` renvoie la 404 pour les autres slugs. Les paramètres se lisent avec `await params` dans cette version de Next.js.

## Vérifier

```bash
npm test
npm run lint
npm run build
```

Après avoir lancé un serveur :

```bash
npm run test:http
```

Pour vérifier une version compilée démarrée avec `npm start -- --port 3001` :

```bash
TEST_BASE_URL=http://localhost:3001 npm run test:http
```

Les tests React utilisent jsdom, un DOM simulé sans affichage visuel ni navigateur réel. esbuild prépare les composants pour ces tests. Ces outils sont uniquement des dépendances de développement.

## Sources et limites

Les données viennent du [dépôt officiel OpenClassrooms](https://github.com/OpenClassrooms-Student-Center/P4-JS-mission-petits-plats). Le JSON est conservé octet par octet. Les photos officielles ont été allégées ; leurs tailles et empreintes sont dans [le manifeste](docs/images-manifest.json).

Les PDF consultés sont conservés dans `docs/references/`. La fiche d'auto-évaluation contient des exercices Ohmyfood puis une section « Mission — Les Petits Plats », utilisée ici.

Les deux passes de reprise guidées par les relevés Figma ont été validées visuellement dans Brave par Thomas. Les descriptions originales des 49 recettes sans étapes détaillées sont conservées. Les contrôles visuels portent sur les vues et largeurs observées, sans certification individuelle des 50 fiches. Le navigateur de Codex reste bloqué par une vérification de sécurité administrateur ; les tests HTTP et jsdom ne remplacent pas une observation dans un navigateur.

L'[audit final du 11 novembre 2026](docs/audit-final-2026-11-11.md) décrit le nettoyage du code, les 22 tests, les contrôles en développement/production, l'installation neuve et les validations HTML/CSS. Les [preuves structurées](docs/audit-final-2026-11-11.json) identifient les sources de cette passe. La [note de clôture](docs/cloture-2026-11-11.md) complète ce bilan après la contre-vérification indépendante : préchargement du bandeau des fiches, archive de sources et vérifications de livraison. Les rapports précédents restent des traces historiques.
