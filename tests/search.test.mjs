import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  createSearchIndex,
  filterRecipes,
  getFilterOptions,
  getRecipeValues,
  normalizeText,
  FILTER_CATEGORIES,
} from "../lib/search.mjs";

const recipes = JSON.parse(
  readFileSync(new URL("../data/recipes.json", import.meta.url)),
);
const index = createSearchIndex(recipes);
const ids = (list) => list.map(({ id }) => id);

test("les données originales possèdent 50 identifiants et slugs uniques", () => {
  assert.equal(recipes.length, 50);
  assert.equal(new Set(recipes.map(({ id }) => id)).size, 50);
  assert.equal(new Set(recipes.map(({ slug }) => slug)).size, 50);
  assert.equal(recipes[1].slug, "poisson-cru-a-la-tahitienne");
});

test("une recherche de zéro à deux caractères ne filtre pas les recettes", () => {
  for (const query of ["", "c", "co", "  co  "])
    assert.equal(filterRecipes(index, query).length, 50);
});

test("la recherche commence à trois caractères et accepte une expression", () => {
  assert.ok(filterRecipes(index, "coc").length < 50);
  assert.ok(
    filterRecipes(index, "tarte aux pommes").some(({ id }) => id === 6),
  );
});

test("les noms, descriptions et ingrédients sont recherchés", () => {
  assert.ok(filterRecipes(index, "limonade").some(({ id }) => id === 1));
  assert.ok(filterRecipes(index, "consistence").some(({ id }) => id === 1));
  assert.ok(filterRecipes(index, "glaçons").some(({ id }) => id === 1));
});

test("les appareils et ustensiles seuls ne déclenchent pas de résultat principal", () => {
  const recipe = recipes.find(({ id }) => id === 4);
  assert.ok(!filterRecipes(index, "cuiseur de riz").includes(recipe));
  assert.ok(!filterRecipes(index, "passoire").includes(recipe));
});

test("casse, accents composés et décomposés, ligatures et apostrophes sont normalisés", () => {
  assert.deepEqual(
    ids(filterRecipes(index, "CRÈME")),
    ids(filterRecipes(index, "creme")),
  );
  assert.deepEqual(
    ids(filterRecipes(index, "crE\u0300me")),
    ids(filterRecipes(index, "creme")),
  );
  assert.equal(normalizeText(" ŒUF  À l’huile "), "oeuf a l'huile");
  assert.deepEqual(
    ids(filterRecipes(index, "  LAIT   DE COCO  ")),
    ids(filterRecipes(index, "lait de coco")),
  );
});

test("un tag fonctionne sans recherche et correspond à un ingrédient entier", () => {
  assert.deepEqual(
    ids(
      filterRecipes(index, "", [
        { category: "ingredients", value: "LAIT DE COCO" },
      ]),
    ),
    [1, 2, 3],
  );
  assert.equal(
    filterRecipes(index, "", [{ category: "ingredients", value: "coco" }])
      .length,
    0,
  );
});

test("plusieurs tags ingrédients se combinent par intersection", () => {
  assert.deepEqual(
    ids(
      filterRecipes(index, "", [
        { category: "ingredients", value: "Lait de coco" },
        { category: "ingredients", value: "Poulet" },
      ]),
    ),
    [3],
  );
});

test("recherche et trois catégories de tags se combinent", () => {
  assert.deepEqual(
    ids(
      filterRecipes(index, "coco", [
        { category: "ingredients", value: "Lait de coco" },
        { category: "appliances", value: "blender" },
        { category: "ustensils", value: "VERRES" },
      ]),
    ),
    [1],
  );
});

test("la suppression d'un tag élargit les résultats", () => {
  const tags = [
    { category: "ingredients", value: "Lait de coco" },
    { category: "appliances", value: "Blender" },
  ];
  const before = filterRecipes(index, "", tags);
  const after = filterRecipes(index, "", tags.slice(0, 1));
  assert.ok(after.length > before.length);
  assert.ok(before.every((recipe) => after.includes(recipe)));
});

test("les options sont uniques malgré les variations de casse et de lettres accentuées", () => {
  const options = getFilterOptions(recipes);
  for (const { key } of FILTER_CATEGORIES) {
    assert.equal(
      new Set(options[key].map(normalizeText)).size,
      options[key].length,
    );
  }
  assert.equal(
    options.ingredients.filter(
      (value) => normalizeText(value) === "lait de coco",
    ).length,
    1,
  );
});

test("les options sélectionnées disparaissent puis reviennent après suppression", () => {
  const tags = [{ category: "ingredients", value: "Lait de coco" }];
  const visible = filterRecipes(index, "", tags);
  assert.ok(
    !getFilterOptions(visible, tags).ingredients.includes("Lait de coco"),
  );
  assert.ok(getFilterOptions(recipes).ingredients.includes("Lait de coco"));
});

test("chaque option provient d'une recette affichée et garantit un résultat supplémentaire", () => {
  const tags = [{ category: "ingredients", value: "Lait de coco" }];
  const visible = filterRecipes(index, "coco", tags);
  const options = getFilterOptions(visible, tags);
  for (const { key } of FILTER_CATEGORIES) {
    for (const value of options[key]) {
      assert.ok(
        visible.some((recipe) =>
          getRecipeValues(recipe, key)
            .map(normalizeText)
            .includes(normalizeText(value)),
        ),
      );
      assert.ok(
        filterRecipes(index, "coco", [...tags, { category: key, value }])
          .length > 0,
      );
    }
  }
});

test("aucun résultat produit aussi des listes de filtres vides", () => {
  const result = filterRecipes(index, "recette-introuvable-xyz");
  assert.deepEqual(result, []);
  assert.deepEqual(getFilterOptions(result), {
    ingredients: [],
    appliances: [],
    ustensils: [],
  });
});

test("la recherche et les options ne modifient jamais les données originales", () => {
  const before = JSON.stringify(recipes);
  filterRecipes(index, "chocolat", [{ category: "appliances", value: "Four" }]);
  getFilterOptions(recipes);
  assert.equal(JSON.stringify(recipes), before);
});
