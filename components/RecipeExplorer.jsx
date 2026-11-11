"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createSearchIndex,
  filterRecipes,
  FILTER_CATEGORIES,
  getFilterOptions,
  normalizeText,
} from "@/lib/search.mjs";
import FilterDropdown from "./FilterDropdown";
import Hero from "./Hero";
import RecipeCard from "./RecipeCard";
import SearchBar from "./SearchBar";
import SelectedTags from "./SelectedTags";

export default function RecipeExplorer({ recipes }) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [openFilter, setOpenFilter] = useState(null);
  const filtersRef = useRef(null);
  const index = useMemo(() => createSearchIndex(recipes), [recipes]);
  const visibleRecipes = useMemo(
    () => filterRecipes(index, query, selectedTags),
    [index, query, selectedTags],
  );
  const options = useMemo(
    () => getFilterOptions(visibleRecipes, selectedTags),
    [visibleRecipes, selectedTags],
  );

  useEffect(() => {
    function handlePointerDown(event) {
      if (!filtersRef.current?.contains(event.target)) setOpenFilter(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function addTag(tag) {
    setSelectedTags((current) =>
      current.some(
        (item) =>
          item.category === tag.category &&
          normalizeText(item.value) === normalizeText(tag.value),
      )
        ? current
        : [...current, tag],
    );
  }

  function removeTag(tag) {
    setSelectedTags((current) =>
      current.filter(
        (item) =>
          !(
            item.category === tag.category &&
            normalizeText(item.value) === normalizeText(tag.value)
          ),
      ),
    );
  }

  return (
    <>
      <Hero>
        <SearchBar query={query} onChange={setQuery} />
      </Hero>
      <main id="contenu" className="catalogue">
        <h2 className="sr-only">Les recettes</h2>
        <div className="catalogue-toolbar">
          <div className="filters" ref={filtersRef}>
            {FILTER_CATEGORIES.map(({ key, label }) => (
              <FilterDropdown
                key={key}
                category={key}
                label={label}
                options={options[key]}
                isOpen={openFilter === key}
                onToggle={() =>
                  setOpenFilter((current) => (current === key ? null : key))
                }
                onClose={() =>
                  setOpenFilter((current) => (current === key ? null : current))
                }
                onSelect={addTag}
              />
            ))}
          </div>
          <p
            className="recipe-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {visibleRecipes.length}{" "}
            {visibleRecipes.length === 1 ? "recette" : "recettes"}
          </p>
        </div>
        <SelectedTags tags={selectedTags} onRemove={removeTag} />
        {visibleRecipes.length > 0 ? (
          <div className="recipe-grid">
            {visibleRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Aucune recette trouvée</h2>
            <p>
              {normalizeText(query).length >= 3 ? (
                <>
                  Aucune recette ne contient « {query.trim()} » avec ces
                  critères.
                </>
              ) : (
                "Aucune recette ne correspond aux filtres sélectionnés."
              )}
              <br />
              Tu peux chercher « tarte aux pommes », « poisson » ou retirer un
              filtre.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
