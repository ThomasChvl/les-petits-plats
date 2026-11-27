import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const recipes = JSON.parse(
  readFileSync(new URL("../data/recipes.json", import.meta.url)),
);

async function readPage(path) {
  const response = await fetch(new URL(path, base));
  const dom = new JSDOM(await response.text());
  const document = dom.window.document;
  return { response, document, close: () => dom.window.close() };
}

function checkIngredients(list, ingredients) {
  assert.deepEqual(
    [...list.querySelectorAll("dt")].map((element) => element.textContent),
    ingredients.map(({ ingredient }) => ingredient),
  );
  assert.deepEqual(
    [...list.querySelectorAll("dd")].map((element) => element.textContent),
    ingredients.map(({ quantity, unit, unite }) =>
      [quantity, unit ?? unite].filter((value) => value !== undefined).join(" ") || "—",
    ),
  );
}

function checkPageStructure(document) {
  assert.equal(document.querySelectorAll("main").length, 1);
  assert.equal(document.querySelectorAll("h1").length, 1);
  const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
  assert.equal(new Set(ids).size, ids.length, "Identifiants HTML uniques");
  for (const image of document.querySelectorAll("img")) {
    assert.ok(image.hasAttribute("alt"), "Alternative présente sur les images");
  }
  for (const link of document.querySelectorAll("a")) {
    assert.ok(link.getAttribute("href"));
    assert.ok(link.textContent.trim() || link.getAttribute("aria-label"));
  }
}

const home = await readPage("/");
assert.equal(home.response.status, 200);
assert.equal(home.document.documentElement.lang, "fr");
assert.equal(home.document.querySelectorAll(".recipe-card").length, 50);
assert.equal(home.document.querySelectorAll(".filter-toggle").length, 3);
assert.ok(home.document.querySelector("#recipe-search"));
const cardPhotos = [...home.document.querySelectorAll(".recipe-card-photo img")];
assert.equal(cardPhotos[0].getAttribute("loading"), "eager");
assert.ok(cardPhotos.slice(1).every((image) => image.getAttribute("loading") === "lazy"));
const homePreloads = [...home.document.querySelectorAll('link[rel="preload"][as="image"]')]
  .map((link) => link.getAttribute("imagesrcset") ?? link.getAttribute("href") ?? "");
assert.ok(homePreloads.some((source) => source.includes("hero-officiel.jpg")));
// React peut émettre un preload pour une image eager ; aucune autre carte ne doit en recevoir.
const cardPreloads = homePreloads.filter((source) => /Recette\d+\.jpg/.test(source));
assert.ok(cardPreloads.length <= 1);
assert.ok(cardPreloads.every((source) => source.includes("Recette01.jpg")));
checkPageStructure(home.document);
for (const [index, card] of [...home.document.querySelectorAll(".recipe-card")].entries()) {
  checkIngredients(card.querySelector(".ingredient-list"), recipes[index].ingredients);
}
assert.match(home.document.querySelector(".hero h1")?.textContent, /Découvrez nos recettes du quotidien/);
assert.equal(home.document.querySelector(".hero-photo")?.getAttribute("alt"), "");
assert.ok(home.document.querySelector(".brand img")?.getAttribute("src")?.includes("logo.svg"));
assert.match(home.document.querySelector(".site-footer")?.textContent, /Les Petits Plats/);
assert.deepEqual(
  [...home.document.querySelectorAll(".recipe-card-link")].map((link) =>
    link.getAttribute("href"),
  ),
  recipes.map(({ slug }) => `/recette/${slug}`),
);
home.close();
console.log(
  "OK : accueil, 50 cartes, 50 liens, barre de recherche et trois filtres.",
);

// Vérifier tout le catalogue, en limitant les requêtes simultanées.
for (let start = 0; start < recipes.length; start += 5) {
  const results = await Promise.allSettled(
    recipes.slice(start, start + 5).map(async (recipe) => {
      const page = await readPage(`/recette/${recipe.slug}`);
      try {
        assert.equal(page.response.status, 200, recipe.slug);
        checkPageStructure(page.document);
        assert.equal(
          page.document.querySelector("h1")?.textContent,
          recipe.name,
        );
        if (recipe.slug === "poulet-coco-reunionnais") {
          assert.equal(page.document.querySelectorAll(".preparation-steps > li").length, 6);
          assert.equal(page.document.querySelectorAll(".preparation-steps > li > ul").length, 6);
          assert.equal(page.document.querySelectorAll(".preparation-steps > li > ul > li").length, 14);
          assert.match(page.document.querySelector(".preparation-steps")?.textContent, /Coupez le poulet en morceaux/);
          assert.equal(page.document.querySelectorAll(".material-quantity").length, 2);
        } else {
          assert.equal(page.document.querySelector(".preparation")?.textContent, recipe.description);
          assert.equal(page.document.querySelectorAll(".material-quantity").length, 0);
        }
        checkIngredients(page.document.querySelector(".ingredient-list"), recipe.ingredients);
        assert.equal(page.document.querySelector(".detail-body .time-badge")?.textContent, `${recipe.time} min`);
        assert.ok(page.document.querySelector("title")?.textContent.includes(recipe.name));
        assert.equal(page.document.querySelector('meta[name="description"]')?.content, recipe.description);
        assert.ok(page.document.querySelector(".detail-photo img")?.getAttribute("src")?.includes(encodeURIComponent(recipe.image)));
        assert.equal(
          page.document.querySelector(".brand")?.getAttribute("href"),
          "/",
        );
        assert.equal(
          page.document.querySelectorAll(".ingredient-list dt").length,
          recipe.ingredients.length,
        );
        assert.ok(page.document.querySelector(".detail-banner"));
        assert.ok(
          [...page.document.querySelectorAll('link[rel="preload"][as="image"]')].some((link) =>
            (link.getAttribute("imagesrcset") ?? link.getAttribute("href") ?? "").includes("hero-officiel.jpg"),
          ),
          "Le bandeau de fiche doit être préchargé",
        );
        assert.notEqual(page.document.querySelector(".detail-banner-photo")?.getAttribute("loading"), "lazy");
        assert.ok(page.document.querySelector(".site-footer"));
      } finally {
        page.close();
      }

      const image = await fetch(new URL(`/images/${recipe.image}`, base));
      assert.equal(image.status, 200, recipe.image);
      assert.ok(image.headers.get("content-type")?.startsWith("image/jpeg"));
      const downloaded = Buffer.from(await image.arrayBuffer());
      assert.deepEqual(
        downloaded,
        readFileSync(
          new URL(`../public/images/${recipe.image}`, import.meta.url),
        ),
      );
    }),
  );
  for (const result of results) {
    if (result.status === "rejected") throw result.reason;
  }
}
console.log(
  "OK : 50 pages, contenus sources, étapes du Poulet, footer et 50 fichiers JPEG servis sans altération.",
);

for (const path of ["/logo.svg", "/images/hero-officiel.jpg"]) {
  const asset = await fetch(new URL(path, base));
  assert.equal(asset.status, 200, path);
  assert.deepEqual(Buffer.from(await asset.arrayBuffer()), readFileSync(new URL(`../public${path}`, import.meta.url)));
}
console.log("OK : logo SVG et photo officielle servis sans altération.");

for (const path of [
  "/recette/ma-recette",
  "/recette/recette-inexistante",
  "/page-inconnue",
]) {
  const page = await readPage(path);
  try {
    checkPageStructure(page.document);
    assert.equal(page.document.querySelector(".error-code")?.textContent, "404 :(");
    assert.ok(page.document.querySelector(".not-found img")?.getAttribute("src")?.includes("hero-officiel.jpg"));
    assert.equal(page.response.status, 404, path);
    assert.equal(
      page.document.querySelector("h1")?.textContent,
      "La page que vous demandez est introuvable.",
      path,
    );
    assert.equal(
      page.document.querySelector(".brand")?.getAttribute("href"),
      "/",
    );
    assert.ok(
      page.document
        .querySelector('meta[name="robots"]')
        ?.content.includes("noindex"),
    );
  } finally {
    page.close();
  }
}
console.log(
  "OK : trois routes invalides renvoient HTTP 404, la page personnalisée, noindex et le lien d'accueil.",
);

const optimized = await fetch(
  new URL("/_next/image?url=%2Fimages%2FRecette01.jpg&w=640&q=75", base),
  {
    headers: { Accept: "image/webp" },
  },
);
assert.equal(optimized.status, 200);
assert.ok(optimized.headers.get("content-type")?.startsWith("image/"));
assert.ok((await optimized.arrayBuffer()).byteLength > 0);
console.log("OK : optimisation Next/Image en 640 pixels.");
console.log(
  `Vérification HTTP terminée sur ${base}. Aucun contrôle visuel ni navigation réelle par clic.`,
);
