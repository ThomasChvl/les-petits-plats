import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const bundle = new URL("../.next/qa/explorer.cjs", import.meta.url);
mkdirSync(new URL("../.next/qa/", import.meta.url), { recursive: true });

await build({
  entryPoints: [
    fileURLToPath(new URL("../components/RecipeExplorer.jsx", import.meta.url)),
  ],
  outfile: fileURLToPath(bundle),
  bundle: true,
  format: "cjs",
  platform: "node",
  packages: "external",
  jsx: "automatic",
  alias: { "@": projectRoot },
  logLevel: "silent",
});

// jsdom simule le DOM, sans moteur de mise en page ni chargement des images.
const dom = new JSDOM(
  '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Contrôle des composants</title></head><body><div id="root"></div></body></html>',
  {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
  },
);
const { window } = dom;
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "Node",
  "Event",
  "MouseEvent",
]) {
  Object.defineProperty(globalThis, key, {
    value: key === "window" ? window : window[key],
    configurable: true,
  });
}
Object.defineProperty(globalThis, "navigator", {
  value: window.navigator,
  configurable: true,
});
globalThis.self = window;
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const require = createRequire(import.meta.url);
const { createElement, act } = require("react");
const { createRoot } = require("react-dom/client");
const RecipeExplorer = require(fileURLToPath(bundle)).default;
const recipes = JSON.parse(
  readFileSync(new URL("../data/recipes.json", import.meta.url)),
);
const root = createRoot(window.document.getElementById("root"));
const warnings = [];
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args) => warnings.push(args.join(" "));
console.warn = (...args) => warnings.push(args.join(" "));

function button(label) {
  const match = [...document.querySelectorAll("button")].find(
    (element) =>
      element.getAttribute("aria-label") === label ||
      element.textContent.trim() === label,
  );
  assert.ok(match, `Bouton introuvable : ${label}`);
  return match;
}

async function click(label) {
  await act(async () => button(label).click());
}

async function fill(selector, value) {
  const input = document.querySelector(selector);
  assert.ok(input, `Champ introuvable : ${selector}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

function count() {
  return document.querySelectorAll(".recipe-card").length;
}
function optionLabels() {
  return [...document.querySelectorAll(".filter-option")].map(
    (element) => element.textContent,
  );
}

// Ces états permettent de valider le HTML des menus et résultats générés par React.
function saveHtmlState(name) {
  const directory = new URL("../.next/qa/html-states/", import.meta.url);
  mkdirSync(directory, { recursive: true });
  writeFileSync(new URL(`${name}.html`, directory), dom.serialize());
}

after(async () => {
  await act(async () => root.unmount());
  dom.window.close();
  console.error = originalError;
  console.warn = originalWarn;
});

test("les filtres React permettent de chercher, cumuler et supprimer les tags", async () => {
  await act(async () =>
    root.render(createElement(RecipeExplorer, { recipes })),
  );
  assert.equal(count(), 50);
  assert.equal(
    document.querySelector(".recipe-count").textContent,
    "50 recettes",
  );

  await click("Ingrédients");
  await fill("#search-ingredients", "COCO");
  saveHtmlState("menu-ingredients");
  assert.ok(optionLabels().length > 0);
  assert.ok(
    optionLabels().every((label) => label.toLowerCase().includes("coco")),
  );
  await click("Lait de coco");
  assert.equal(count(), 3);
  assert.ok(!optionLabels().includes("Lait de coco"));

  await click("Appareils");
  assert.deepEqual(optionLabels(), ["Blender", "Cocotte", "Saladier"]);
  await click("Blender");
  assert.equal(count(), 1);
  assert.equal(
    document.querySelector(".recipe-count").textContent,
    "1 recette",
  );

  await click("Ustensiles");
  await fill("#search-ustensils", "VER");
  assert.deepEqual(optionLabels(), ["Verres"]);
  await click("Verres");
  assert.equal(count(), 1);
  assert.equal(document.querySelectorAll(".selected-tag").length, 3);
  saveHtmlState("trois-tags");

  await click("Supprimer le filtre Appareils : Blender");
  await click("Supprimer le filtre Ustensiles : Verres");
  assert.equal(count(), 3);
  await click("Supprimer le filtre Ingrédients : Lait de coco");
  assert.equal(count(), 50);
  await click("Ingrédients");
  assert.ok(optionLabels().includes("Lait de coco"));

  await fill("#search-ingredients", "aucune-option-xyz");
  assert.equal(
    document.querySelector(".filter-empty").textContent,
    "Aucune option disponible.",
  );
  await click("Effacer la recherche ingrédients");
  assert.ok(optionLabels().length > 0);
  await act(async () =>
    document
      .querySelector("#search-ingredients")
      .dispatchEvent(
        new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
  );
  assert.equal(button("Ingrédients").getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, button("Ingrédients"));
});

test("la recherche principale respecte le seuil, la casse et les accents", async () => {
  await fill("#recipe-search", "co");
  assert.equal(count(), 50);
  await fill("#recipe-search", "coco");
  assert.ok(count() > 0 && count() < 50);
  await fill("#recipe-search", "CRÈME");
  const accented = [...document.querySelectorAll(".recipe-card h3")].map(
    (element) => element.textContent,
  );
  await fill("#recipe-search", "creme");
  assert.deepEqual(
    [...document.querySelectorAll(".recipe-card h3")].map(
      (element) => element.textContent,
    ),
    accented,
  );
  await click("Effacer la recherche principale");
  assert.equal(count(), 50);
  assert.equal(document.activeElement.id, "recipe-search");
});

test("la recherche principale fonctionne avec les trois catégories de tags", async () => {
  await fill("#recipe-search", "coco");
  await click("Ingrédients");
  await click("Lait de coco");
  assert.equal(count(), 3);
  await click("Appareils");
  await click("Blender");
  await click("Ustensiles");
  await click("Verres");
  assert.equal(count(), 1);
  assert.equal(
    document.querySelector(".recipe-card h3").textContent,
    "Limonade de Coco",
  );
  const link = document.querySelector(".recipe-card-link");
  assert.equal(link.getAttribute("href"), "/recette/limonade-de-coco");
  await click("Effacer la recherche principale");
  assert.equal(count(), 1);
  await click("Supprimer le filtre Ingrédients : Lait de coco");
  await click("Supprimer le filtre Appareils : Blender");
  await click("Supprimer le filtre Ustensiles : Verres");
  assert.equal(count(), 50);
});

test("l'absence de résultats affiche le message, zéro recette et zéro option", async () => {
  await fill("#recipe-search", "introuvable-xyz");
  assert.equal(count(), 0);
  assert.equal(
    document.querySelector(".recipe-count").textContent,
    "0 recettes",
  );
  assert.ok(
    document
      .querySelector(".empty-state")
      .textContent.includes("introuvable-xyz"),
  );
  await click("Ingrédients");
  assert.deepEqual(optionLabels(), []);
  saveHtmlState("aucun-resultat");
  await click("Effacer la recherche principale");
  assert.equal(count(), 50);
});

test("le filtre s'ouvre au clavier et se ferme à la sortie du focus ou au clic extérieur", async () => {
  const toggle = button("Ingrédients");
  if (toggle.getAttribute("aria-expanded") === "true") await click("Ingrédients");
  await act(async () => {
    toggle.focus();
    toggle.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 30));
  });
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(document.activeElement.id, "search-ingredients");
  await act(async () => document.querySelector("#recipe-search").focus());
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  await click("Ingrédients");
  await act(async () => document.body.dispatchEvent(new window.Event("pointerdown", { bubbles: true })));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});

test("deux tags de la même catégorie gardent uniquement les recettes qui possèdent les deux", async () => {
  await click("Ingrédients");
  await click("Lait de coco");
  await click("Poulet");
  assert.equal(count(), 1);
  assert.equal(document.querySelector(".recipe-card h3").textContent, "Poulet coco réunionnais");
  await click("Supprimer le filtre Ingrédients : Poulet");
  assert.equal(count(), 3);
  await click("Supprimer le filtre Ingrédients : Lait de coco");
  assert.equal(count(), 50);
});

test("aucun warning React n'est enregistré pendant les interactions", () => {
  assert.deepEqual(warnings, []);
});
