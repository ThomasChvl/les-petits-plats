export const FILTER_CATEGORIES = [
  { key: "ingredients", label: "Ingrédients" },
  { key: "appliances", label: "Appareils" },
  { key: "ustensils", label: "Ustensiles" },
];

// Normaliser permet de comparer « CRÈME » et « creme » sans modifier les données.
export function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function getRecipeValues(recipe, category) {
  if (category === "ingredients") {
    return recipe.ingredients.map(({ ingredient }) => ingredient);
  }
  if (category === "appliances") return [recipe.appliance];
  if (category === "ustensils") return recipe.ustensils;
  return [];
}

export function formatOption(value) {
  const label = value.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");
  return label.charAt(0).toLocaleUpperCase("fr") + label.slice(1);
}

// Les champs sont préparés une seule fois : pas à chaque frappe.
export function createSearchIndex(recipes) {
  return recipes.map((recipe) => ({
    recipe,
    fields: [
      recipe.name,
      recipe.description,
      ...getRecipeValues(recipe, "ingredients"),
    ].map(normalizeText),
    tags: Object.fromEntries(
      FILTER_CATEGORIES.map(({ key }) => [
        key,
        getRecipeValues(recipe, key).map(normalizeText),
      ]),
    ),
  }));
}

export function filterRecipes(index, query = "", selectedTags = []) {
  const search = normalizeText(query);
  const tags = selectedTags.map(({ category, value }) => ({
    category,
    value: normalizeText(value),
  }));

  return index
    .filter(({ fields, tags: recipeTags }) => {
      const matchesSearch =
        search.length < 3 || fields.some((field) => field.includes(search));
      // every = tous les tags doivent correspondre, y compris dans une même catégorie.
      const matchesTags = tags.every(({ category, value }) =>
        recipeTags[category]?.includes(value),
      );
      return matchesSearch && matchesTags;
    })
    .map(({ recipe }) => recipe);
}

export function getFilterOptions(recipes, selectedTags = []) {
  return Object.fromEntries(
    FILTER_CATEGORIES.map(({ key }) => {
      const selected = new Set(
        selectedTags
          .filter(({ category }) => category === key)
          .map(({ value }) => normalizeText(value)),
      );
      const options = new Map();

      for (const recipe of recipes) {
        for (const value of getRecipeValues(recipe, key)) {
          const normalized = normalizeText(value);
          if (!selected.has(normalized) && !options.has(normalized)) {
            options.set(normalized, formatOption(value));
          }
        }
      }

      return [
        key,
        [...options.values()].sort((a, b) => a.localeCompare(b, "fr")),
      ];
    }),
  );
}
