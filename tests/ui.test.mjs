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

async function pressPointer(target) {
  await act(async () => {
    target.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
    target.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true, button: 0 }));
    // jsdom ne réalise pas le transfert de focus par défaut de mousedown.
    target.focus();
  });
}

async function releasePointer(target) {
  await act(async () => {
    target.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true, button: 0, pointerType: "mouse" }));
    target.dispatchEvent(new window.MouseEvent("mouseup", { bubbles: true, button: 0 }));
    target.click();
  });
}

async function click(label) {
  const target = button(label);
  // Deux phases pour laisser React traiter le blur AVANT le relâchement et le clic.
  await pressPointer(target);
  await releasePointer(target);
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
  assert.equal(button("Ingrédients").getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, button("Ingrédients"));
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
  await fill("#recipe-search", "po");
  assert.equal(count(), 50);
  await fill("#recipe-search", "pou");
  assert.equal(count(), 13);
  assert.equal(document.querySelector(".recipe-count").textContent, "13 recettes");
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
  await click("Ingrédients");
  await click("Poulet");
  assert.equal(count(), 1);
  assert.equal(document.querySelector(".recipe-card h3").textContent, "Poulet coco réunionnais");
  await click("Ingrédients");
  assert.ok(optionLabels().includes("Oignon"));
  await click("Supprimer le filtre Ingrédients : Poulet");
  assert.equal(count(), 3);
  assert.equal(document.activeElement, button("Supprimer le filtre Ingrédients : Lait de coco"));
  assert.equal(button("Ingrédients").getAttribute("aria-expanded"), "false");
  await click("Supprimer le filtre Ingrédients : Lait de coco");
  assert.equal(count(), 50);
  assert.equal(document.activeElement, button("Ingrédients"));
});

test("chaque menu se ferme après sélection et Échap, avec retour du focus au sélecteur", async () => {
  for (const { label, category, value } of [
    { label: "Ingrédients", category: "ingredients", value: "Ail" },
    { label: "Appareils", category: "appliances", value: "Mixer" },
    { label: "Ustensiles", category: "ustensils", value: "Casserole" },
  ]) {
    await click(label);
    await click(value);
    assert.equal(button(label).getAttribute("aria-expanded"), "false");
    assert.equal(document.activeElement, button(label));
    await click(label);
    await act(async () => {
      const input = document.querySelector(`#search-${category}`);
      input.focus();
      input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    assert.equal(button(label).getAttribute("aria-expanded"), "false");
    assert.equal(document.activeElement, button(label));
  }
  assert.equal(count(), 1);
  assert.equal(document.querySelector(".recipe-card h3").textContent, "Purée de pois cassés");

  // Changement de menu et retrait d'un tag pendant qu'un autre menu est ouvert.
  await click("Ingrédients");
  await click("Appareils");
  assert.equal(button("Ingrédients").getAttribute("aria-expanded"), "false");
  assert.equal(button("Appareils").getAttribute("aria-expanded"), "true");
  await click("Supprimer le filtre Ingrédients : Ail");
  assert.equal(button("Appareils").getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, button("Ingrédients"));
  for (const label of ["Supprimer le filtre Appareils : Mixer", "Supprimer le filtre Ustensiles : Casserole"]) {
    await click(label);
  }
  assert.equal(count(), 50);
  await click("Ingrédients");
  assert.ok(optionLabels().includes("Ail"));
  await click("Ingrédients");
});

test("un libellé long reste sélectionnable et son retrait conserve un focus utile", async () => {
  const value = "Moule à tartelettes (6)";
  await click("Ustensiles");
  await fill("#search-ustensils", "MOULE À TARTELETTES");
  assert.ok(optionLabels().includes(value));
  await click(value);
  assert.ok(count() > 0 && count() < 50);
  assert.equal(document.querySelector(".selected-tag span").textContent, value);
  await act(async () => button(`Supprimer le filtre Ustensiles : ${value}`).focus());
  await click(`Supprimer le filtre Ustensiles : ${value}`);
  assert.equal(document.activeElement, button("Ustensiles"));
  assert.equal(count(), 50);
});

test("le panneau et la cible restent en place jusqu'au clic de suppression d'un tag", async () => {
  let scenario = 0;
  try {
    for (const { label, category, value, openLabel, openCategory } of [
      { label: "Ingrédients", category: "ingredients", value: "Lait de coco" },
      { label: "Appareils", category: "appliances", value: "Blender" },
      { label: "Ustensiles", category: "ustensils", value: "Verres" },
      // Un panneau d'une autre catégorie déplace aussi les tags sur mobile.
      { label: "Ustensiles", category: "ustensils", value: "Verres", openLabel: "Ingrédients", openCategory: "ingredients" },
    ]) {
      await act(async () => root.render(createElement(RecipeExplorer, { recipes, key: `pointer-${++scenario}` })));
      await click(label);
      await click(value);
      const filteredCount = count();
      assert.ok(filteredCount > 0 && filteredCount < 50);
      await click(openLabel ?? label);
      await act(async () => document.querySelector(`#search-${openCategory ?? category}`).focus());

      const target = button(`Supprimer le filtre ${label} : ${value}`);
      const events = [];
      for (const type of ["pointerdown", "mousedown", "focus", "pointerup", "mouseup", "click"]) {
        target.addEventListener(type, () => events.push(type));
      }
      await pressPointer(target);
      // Une fermeture ici déplacerait la croix avant pointerup dans un vrai navigateur.
      assert.equal(button(openLabel ?? label).getAttribute("aria-expanded"), "true");
      assert.equal(target.isConnected, true);
      assert.equal(document.activeElement, target);
      assert.equal(count(), filteredCount);
      await releasePointer(target);
      assert.deepEqual(events, ["pointerdown", "mousedown", "focus", "pointerup", "mouseup", "click"]);
      assert.equal(target.isConnected, false);
      assert.equal(count(), 50);
      assert.equal(document.querySelector(".filter-panel"), null);
      assert.equal(document.activeElement, button(label));
      await click(label);
      assert.ok(optionLabels().includes(value));
    }
  } finally {
    await act(async () => root.render(createElement(RecipeExplorer, { recipes, key: "after-pointer" })));
  }
});

test("seule la première photo affichée charge immédiatement, y compris après filtrage", async () => {
  function checkLoading(expectedCount) {
    const images = [...document.querySelectorAll(".recipe-card-photo img")];
    assert.equal(images.length, expectedCount);
    assert.equal(images[0].getAttribute("loading"), "eager");
    assert.ok(images.slice(1).every((image) => image.getAttribute("loading") === "lazy"));
    return images[0];
  }
  const initialPhoto = checkLoading(50);
  assert.ok(initialPhoto.getAttribute("src").includes("Recette01.jpg"));
  await fill("#recipe-search", "pou");
  const firstFiltered = checkLoading(13);
  // "pou" trouve aussi des descriptions : le premier résultat est le Poisson.
  assert.equal(firstFiltered.getAttribute("alt"), "Poisson Cru à la tahitienne");
  assert.ok(firstFiltered.getAttribute("src").includes("Recette02.jpg"));
  await fill("#recipe-search", "introuvable-xyz");
  assert.equal(document.querySelectorAll(".recipe-card-photo img").length, 0);
  await click("Effacer la recherche principale");
  assert.ok(checkLoading(50).getAttribute("src").includes("Recette01.jpg"));
});

test("Échap depuis un tag ferme le menu sans le supprimer et rend le focus au sélecteur", async () => {
  await click("Ingrédients");
  await click("Lait de coco");
  await click("Ingrédients");
  const remove = button("Supprimer le filtre Ingrédients : Lait de coco");
  await act(async () => remove.focus());
  assert.equal(button("Ingrédients").getAttribute("aria-expanded"), "true");
  await act(async () => remove.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  assert.equal(button("Ingrédients").getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, button("Ingrédients"));
  assert.equal(count(), 3);
  await click("Supprimer le filtre Ingrédients : Lait de coco");
  assert.equal(count(), 50);
});

test("aucun warning React n'est enregistré pendant les interactions", () => {
  assert.deepEqual(warnings, []);
});
